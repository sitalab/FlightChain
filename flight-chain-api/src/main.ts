import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";
var  asn1js = require('asn1js');
const x509 = require('x509');

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

    const options = new DocumentBuilder()
        .setTitle('Flight Chain REST API')
        .setDescription('The Flight Chain API description')
        .setVersion('1.0')
        .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api', app, document);


    await app.listen(3000);
}

bootstrap();
