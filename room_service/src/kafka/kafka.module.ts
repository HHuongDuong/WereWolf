import { Module, Global } from '@nestjs/common';
import { KafkaProducerService } from './kafka.producer';

/**
 * @Global() — KafkaProducerService được inject ở bất kỳ module nào
 * mà không cần import KafkaModule lại.
 */
@Global()
@Module({
  providers: [KafkaProducerService],
  exports: [KafkaProducerService],
})
export class KafkaModule {}
