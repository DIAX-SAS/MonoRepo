export interface Config { 
  socketURL: string;
  offsetKeys: string[];
  keyPIMMNumber: string;
  auth: {
    clientId: string;
    logoutUri: string;
    cognitoDomain: string;
    authority: string;
    redirectUri: string;
    response_type: string;
    scope: string;
  };
  backendURL: string;
}

export const config: Config = {
  socketURL: 'wss://d0978261uk2h0hot7q0x-ats.iot.us-east-1.amazonaws.com',
  offsetKeys: [
    'Minutos Motor Encendido',
    'Contador Inyecciones',
    'Contador Unidades',
    'KW Motor',
    'KW Total Maquina',
    'Minutos Mantto Maquina',
    'Minutos Mantto Molde',
    'Minutos Montaje',
    'Minutos Sin Operario',
    'Minutos No Programada',
    'Minutos Fin Produccion',
    'Minutos Por Material',
    'Minutos Calidad',
    'Minutos Fin Turno',
    'Unidades Defecto Inicio Turno',
    'Unidades No Conformes',
  ],
  keyPIMMNumber: 'Numero Inyectora',
  auth: {
    clientId: '1dgddk7rc0bir0mt3g403kojcc',
    logoutUri: 'http://localhost:4000/sign-in',
    cognitoDomain: 'https://crud-diax.auth.us-east-1.amazoncognito.com',
    authority:
      'https://cognito-idp.us-east-1.amazonaws.com/us-east-1_bHo9GIUJg',
    redirectUri: 'http://localhost:4000/'.concat('redirect'),
    response_type: 'code',
    scope: 'email openid phone',
  },
  backendURL: 'http://localhost:3000/api',
};
