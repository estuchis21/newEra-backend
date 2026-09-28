import {
    Injectable,
} from '@nestjs/common';

import * as nodemailer from 'nodemailer';

@Injectable()
export class MailService {

    private transporter;

    constructor() {

        this.transporter =
            nodemailer.createTransport({

                host:
                    process.env.MAIL_HOST,

                port:
                    Number(
                        process.env.MAIL_PORT
                    ),

                secure: false,

                auth: {

                    user:
                        process.env.MAIL_USER,

                    pass:
                        process.env.MAIL_PASSWORD,

                },

            });
    }

    async enviarEmailRecuperacion(
        email: string,
        token: string,
    ) {

        const frontendUrl =
            process.env.FRONTEND_URL ??
            'http://localhost:5173';

        const link =
            `${frontendUrl}/reset-password?token=${token}`;

        await this.transporter.sendMail({

            from:
                process.env.MAIL_FROM,

            to:
                email,

            subject:
                'Recuperación de contraseña',

            html: `

                <div
                    style="
                        font-family: Arial;
                        max-width: 600px;
                        margin: auto;
                        padding: 30px;
                    "
                >

                    <h2>
                        Recuperación de contraseña
                    </h2>

                    <p>
                        Recibimos una solicitud para
                        recuperar tu contraseña.
                    </p>

                    <p>
                        Hacé click en el siguiente botón:
                    </p>

                    <div
                        style="
                            text-align: center;
                            margin: 30px 0;
                        "
                    >

                        <a
                            href="${link}"
                            style="
                                background: #9b00ff;
                                color: white;
                                padding: 12px 25px;
                                text-decoration: none;
                                border-radius: 8px;
                            "
                        >
                            Recuperar contraseña
                        </a>

                    </div>

                    <p>
                        Este enlace será válido durante
                        30 minutos.
                    </p>

                    <p>
                        Si no solicitaste este cambio,
                        podés ignorar este mensaje.
                    </p>

                </div>

            `,
        });
    }
}