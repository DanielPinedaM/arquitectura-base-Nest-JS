---
title: Usa colas de mensajes para los trabajos en segundo plano
impact: MEDIUM
impactDescription: Las colas permiten un procesamiento en segundo plano confiable
tags: microservices, queues, bullmq, background-jobs
---

## Usa colas de mensajes para los trabajos en segundo plano

Usa `@nestjs/bullmq` para el procesamiento de trabajos en segundo plano. Las colas desacoplan las tareas de larga duración de las peticiones HTTP, permiten la lógica de reintentos y distribuyen la carga de trabajo entre workers. Úsalas para emails, procesamiento de archivos, notificaciones y cualquier tarea que no deba bloquear las peticiones de los usuarios.

**Incorrecto (tareas de larga duración en los handlers HTTP):**

```typescript
// Tareas de larga duración en los handlers HTTP
@Controller('reports')
export class ReportsController {
  @Post()
  async generate(@Body() dto: GenerateReportDto): Promise<Report> {
    // Esto bloquea la petición potencialmente durante minutos
    const data = await this.fetchLargeDataset(dto);
    const report = await this.processData(data); // ¡Lento!
    await this.sendEmail(dto.email, report); // ¡Puede fallar!
    return report; // El cliente excede el timeout
  }
}

// Fire-and-forget sin reintentos
@Injectable()
export class EmailService {
  async sendWelcome(email: string): Promise<void> {
    // Si esto falla, el email nunca se envía
    await this.mailer.send({ to: email, template: 'welcome' });
    // Sin reintentos, sin seguimiento, sin visibilidad
  }
}

// Usa setInterval para las tareas programadas
setInterval(async () => {
  await cleanupOldRecords();
}, 60000); // Sin manejo de errores, fugas de memoria
```

**Correcto (usa BullMQ para el procesamiento en segundo plano):**

```typescript
// Configura BullMQ
import { BullModule } from '@nestjs/bullmq';

@Module({
  imports: [
    BullModule.forRoot({
      connection: {
        host: 'localhost',
        port: 6379,
      },
      defaultJobOptions: {
        removeOnComplete: 1000,
        removeOnFail: 5000,
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 1000,
        },
      },
    }),
    BullModule.registerQueue(
      { name: 'email' },
      { name: 'reports' },
      { name: 'notifications' },
    ),
  ],
})
export class QueueModule {}

// Productor: agrega trabajos a la cola
@Injectable()
export class ReportsService {
  constructor(
    @InjectQueue('reports') private reportsQueue: Queue,
  ) {}

  async requestReport(dto: GenerateReportDto): Promise<{ jobId: string }> {
    // Retorna de inmediato, procesa en segundo plano
    const job = await this.reportsQueue.add('generate', dto, {
      priority: dto.urgent ? 1 : 10,
      delay: dto.scheduledFor ? Date.parse(dto.scheduledFor) - Date.now() : 0,
    });

    return { jobId: job.id };
  }

  async getJobStatus(jobId: string): Promise<JobStatus> {
    const job = await this.reportsQueue.getJob(jobId);
    return {
      status: await job.getState(),
      progress: job.progress,
      result: job.returnvalue,
    };
  }
}

// Consumidor: procesa los trabajos
@Processor('reports')
export class ReportsProcessor {
  private readonly logger = new Logger(ReportsProcessor.name);

  @Process('generate')
  async generateReport(job: Job<GenerateReportDto>): Promise<Report> {
    this.logger.log(`Processing report job ${job.id}`);

    // Actualiza el progreso
    await job.updateProgress(10);

    const data = await this.fetchData(job.data);
    await job.updateProgress(50);

    const report = await this.processData(data);
    await job.updateProgress(90);

    await this.saveReport(report);
    await job.updateProgress(100);

    return report;
  }

  @OnQueueActive()
  onActive(job: Job) {
    this.logger.log(`Processing job ${job.id}`);
  }

  @OnQueueCompleted()
  onCompleted(job: Job, result: any) {
    this.logger.log(`Job ${job.id} completed`);
  }

  @OnQueueFailed()
  onFailed(job: Job, error: Error) {
    this.logger.error(`Job ${job.id} failed: ${error.message}`);
  }
}

// Cola de emails con reintentos
@Processor('email')
export class EmailProcessor {
  @Process('send')
  async sendEmail(job: Job<SendEmailDto>): Promise<void> {
    const { to, template, data } = job.data;

    try {
      await this.mailer.send({
        to,
        template,
        context: data,
      });
    } catch (error) {
      // BullMQ reintentará según las opciones del trabajo
      throw error;
    }
  }
}

// Uso
@Injectable()
export class NotificationService {
  constructor(@InjectQueue('email') private emailQueue: Queue) {}

  async sendWelcome(user: User): Promise<void> {
    await this.emailQueue.add(
      'send',
      {
        to: user.email,
        template: 'welcome',
        data: { name: user.name },
      },
      {
        attempts: 5,
        backoff: { type: 'exponential', delay: 5000 },
      },
    );
  }
}

// Trabajos programados
@Injectable()
export class ScheduledJobsService implements OnModuleInit {
  constructor(@InjectQueue('maintenance') private queue: Queue) {}

  async onModuleInit(): Promise<void> {
    // Limpia los reportes antiguos diariamente a medianoche
    await this.queue.add(
      'cleanup',
      {},
      {
        repeat: { cron: '0 0 * * *' },
        jobId: 'daily-cleanup', // Evita duplicados
      },
    );

    // Envía un resumen cada hora
    await this.queue.add(
      'digest',
      {},
      {
        repeat: { every: 60 * 60 * 1000 },
        jobId: 'hourly-digest',
      },
    );
  }
}

@Processor('maintenance')
export class MaintenanceProcessor {
  @Process('cleanup')
  async cleanup(): Promise<void> {
    await this.cleanupOldReports();
    await this.cleanupExpiredSessions();
  }

  @Process('digest')
  async sendDigest(): Promise<void> {
    const users = await this.getUsersForDigest();
    for (const user of users) {
      await this.emailQueue.add('send', { to: user.email, template: 'digest' });
    }
  }
}

// Monitoreo de las colas con Bull Board
import { BullBoardModule } from '@bull-board/nestjs';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';

@Module({
  imports: [
    BullBoardModule.forRoot({
      route: '/admin/queues',
      adapter: ExpressAdapter,
    }),
    BullBoardModule.forFeature({
      name: 'email',
      adapter: BullMQAdapter,
    }),
    BullBoardModule.forFeature({
      name: 'reports',
      adapter: BullMQAdapter,
    }),
  ],
})
export class AdminModule {}
```

Referencia: [NestJS Queues](https://docs.nestjs.com/techniques/queues)
