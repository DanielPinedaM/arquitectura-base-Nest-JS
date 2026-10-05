---
title: Aplica el Interface Segregation Principle
impact: CRITICAL
impactDescription: Reduce el acoplamiento y mejora la testeabilidad entre un 30 y un 50%
tags: dependency-injection, interfaces, solid, isp
---

## Aplica el Interface Segregation Principle

Los clientes no deben verse obligados a depender de interfaces que no usan. En NestJS, esto significa mantener las interfaces pequeñas y enfocadas en capacidades específicas, en lugar de crear interfaces "gordas" que agrupen métodos no relacionados. Cuando un servicio solo necesita enviar emails, no debería depender de una interfaz que también incluye SMS, notificaciones push y logging. Divide las interfaces grandes en interfaces basadas en roles.

**Incorrecto (interfaz gorda que fuerza dependencias sin usar):**

```typescript
// Interfaz gorda - obliga a todos los consumidores a depender de todo
interface NotificationService {
  sendEmail(to: string, subject: string, body: string): Promise<void>;
  sendSms(phone: string, message: string): Promise<void>;
  sendPush(userId: string, notification: PushPayload): Promise<void>;
  sendSlack(channel: string, message: string): Promise<void>;
  logNotification(type: string, payload: any): Promise<void>;
  getDeliveryStatus(id: string): Promise<DeliveryStatus>;
  retryFailed(id: string): Promise<void>;
  scheduleNotification(dto: ScheduleDto): Promise<string>;
}

// El consumidor solo necesita email, pero debe hacer mock de todo para los tests
@Injectable()
export class OrdersService {
  constructor(
    private notifications: NotificationService, // Depende de 8 métodos, usa 1
  ) {}

  async confirmOrder(order: Order): Promise<void> {
    await this.notifications.sendEmail(
      order.customer.email,
      'Order Confirmed',
      `Your order ${order.id} has been confirmed.`,
    );
  }
}

// El testing es tedioso - hay que hacer mock de métodos sin usar
const mockNotificationService = {
  sendEmail: jest.fn(),
  sendSms: jest.fn(),           // Nunca se usa, pero es obligatorio
  sendPush: jest.fn(),          // Nunca se usa, pero es obligatorio
  sendSlack: jest.fn(),         // Nunca se usa, pero es obligatorio
  logNotification: jest.fn(),   // Nunca se usa, pero es obligatorio
  getDeliveryStatus: jest.fn(), // Nunca se usa, pero es obligatorio
  retryFailed: jest.fn(),       // Nunca se usa, pero es obligatorio
  scheduleNotification: jest.fn(), // Nunca se usa, pero es obligatorio
};
```

**Correcto (interfaces segregadas por capacidad):**

```typescript
// Interfaces segregadas - cada una enfocada en una capacidad
interface EmailSender {
  sendEmail(to: string, subject: string, body: string): Promise<void>;
}

interface SmsSender {
  sendSms(phone: string, message: string): Promise<void>;
}

interface PushSender {
  sendPush(userId: string, notification: PushPayload): Promise<void>;
}

interface NotificationLogger {
  logNotification(type: string, payload: any): Promise<void>;
}

interface NotificationScheduler {
  scheduleNotification(dto: ScheduleDto): Promise<string>;
}

// La implementación puede implementar múltiples interfaces
@Injectable()
export class NotificationService implements EmailSender, SmsSender, PushSender {
  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    // Implementación de email
  }

  async sendSms(phone: string, message: string): Promise<void> {
    // Implementación de SMS
  }

  async sendPush(userId: string, notification: PushPayload): Promise<void> {
    // Implementación de push
  }
}

// O implementaciones separadas
@Injectable()
export class SendGridEmailService implements EmailSender {
  async sendEmail(to: string, subject: string, body: string): Promise<void> {
    // Implementación específica de SendGrid
  }
}

// El consumidor depende solo de lo que necesita
@Injectable()
export class OrdersService {
  constructor(
    @Inject(EMAIL_SENDER) private emailSender: EmailSender, // Dependencia mínima
  ) {}

  async confirmOrder(order: Order): Promise<void> {
    await this.emailSender.sendEmail(
      order.customer.email,
      'Order Confirmed',
      `Your order ${order.id} has been confirmed.`,
    );
  }
}

// El testing es simple - solo se hace mock de lo que se usa
const mockEmailSender: EmailSender = {
  sendEmail: jest.fn(),
};

// Registro en el módulo con tokens
export const EMAIL_SENDER = Symbol('EMAIL_SENDER');
export const SMS_SENDER = Symbol('SMS_SENDER');

@Module({
  providers: [
    { provide: EMAIL_SENDER, useClass: SendGridEmailService },
    { provide: SMS_SENDER, useClass: TwilioSmsService },
  ],
  exports: [EMAIL_SENDER, SMS_SENDER],
})
export class NotificationModule {}
```

**Combinar interfaces cuando sea necesario:**

```typescript
// A veces un consumidor legítimamente necesita múltiples capacidades
interface EmailAndSmsSender extends EmailSender, SmsSender {}

// O usa intersection types
type MultiChannelSender = EmailSender & SmsSender & PushSender;

// Consumidor que realmente necesita múltiples canales
@Injectable()
export class AlertService {
  constructor(
    @Inject(MULTI_CHANNEL_SENDER)
    private sender: EmailSender & SmsSender,
  ) {}

  async sendCriticalAlert(user: User, message: string): Promise<void> {
    await Promise.all([
      this.sender.sendEmail(user.email, 'Critical Alert', message),
      this.sender.sendSms(user.phone, message),
    ]);
  }
}
```

Referencia: [Interface Segregation Principle](https://en.wikipedia.org/wiki/Interface_segregation_principle)
