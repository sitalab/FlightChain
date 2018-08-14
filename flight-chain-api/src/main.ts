import {NestFactory} from '@nestjs/core';
import {AppModule} from './app.module';
import {DocumentBuilder, SwaggerModule} from "@nestjs/swagger";

let identityIATA = null;

async function bootstrap() {
    const app = await NestFactory.create(AppModule);

    let port = process.env.LISTEN_PORT;

    if (!port) {
        console.error('You must specify the LISTEN_PORT as an environment variable.');
        process.exit(201);
    }
    let identityIATA = process.env.IDENTITY;
    if (!identityIATA) {
        console.error('You must specify the IDENTITY as an environment variable.');
        process.exit(201);
    }

    console.info(`Starting FlightChain API for ${identityIATA} on port ${port}`);

    const options = new DocumentBuilder()
        .setTitle(`Flight Chain REST API for ${identityIATA}`)
        // .setDescription('The Flight Chain API description')
        .setVersion('1.0')
        .build();
    const document = SwaggerModule.createDocument(app, options);
    SwaggerModule.setup('api', app, document);

    app.enableCors();
    await app.listen(port);
}

bootstrap();
