# SOLmate: Tu Compañero Interactivo en la Blockchain de Solana

**SOLmate** es una plataforma interactiva basada en un *chatbot* que emplea **inteligencia artificial (IA) avanzada** para facilitar la interacción con la blockchain de Solana. Este proyecto proporciona una interfaz amigable y sencilla para los usuarios, permitiéndoles realizar una serie de operaciones de blockchain, como **crear una nueva cuenta de Solana**, **enviar Sol** (la criptomoneda nativa de Solana) a una billetera digital o **consultar el balance** de una cuenta.

## Tecnología Subyacente

El núcleo del sistema de SOLmate se basa en un *modelo de lenguaje grande*, posiblemente similar a GPT-4 u otros modelos sucesores de la serie GPT desarrollada por OpenAI, que ha sido entrenado para comprender y generar lenguaje humano en un nivel muy sofisticado.

## Uso de Embeddings

Una característica única de SOLmate es su uso de *embeddings*, que son **representaciones matemáticas** (generalmente vectores) que capturan el significado de palabras, frases, oraciones o incluso documentos completos. En este caso, los embeddings se utilizan para controlar el output del chatbot.

## Cálculo de Distancia y Acción

El sistema calcula la distancia (usando alguna medida como la distancia coseno) entre el embedding del input del usuario y el conjunto predefinido de embeddings que representan acciones específicas (como crear una cuenta, enviar Sol, etc.). Si la distancia es inferior a un cierto umbral (en este caso, 9), el sistema asume que la intención del usuario está clara y procede a realizar la acción correspondiente. Si la distancia es mayor, el sistema solicita más información al usuario para aclarar su intención.

## Registro de Contexto de Conversación

SOLmate también mantiene un registro del **contexto de la conversación**, lo que le permite entender y responder a consultas que se relacionan con mensajes anteriores en la conversación.

## Interacción con Solana Blockchain

Por último, SOLmate interactúa con la blockchain de Solana mediante el uso de **librerías de Solana**. Estas librerías permiten que SOLmate realice acciones como crear cuentas de Solana y realizar transacciones con Sol, todo ello de forma segura y eficiente.

## En Resumen

SOLmate es un proyecto que combina la **IA de vanguardia** con la **tecnología blockchain** para proporcionar una interfaz de usuario potente y fácil de usar para interactuar con la blockchain de Solana.

# Ejecución Local de SOLmate

Para ejecutar SOLmate en tu máquina local, sigue los siguientes pasos:

## Configuración del Entorno

Deberás crear un archivo `.env` en la raíz del proyecto con los siguientes valores:

```markdown
OPENAI_API_KEY=<tu llave>
ORGANIZATION_ID=<tu llave>
PORT=1337
AI_URL=http://localhost:5000
SOLANA_RPC=http://localhost:8899 // Si corres solana validator o la URL de testnet de Solana si prefieres.
NITRO_PRESET=digital-ocean
```

Asegúrate de reemplazar `<tu llave>` con tus llaves API y de organización correspondientes.

## Instalación de Dependencias

Una vez configurado el entorno, instala las dependencias del proyecto ejecutando el siguiente comando en tu terminal:

```bash
yarn install
```

## Ejecución del Proyecto

Finalmente, para iniciar SOLmate en tu máquina local, ejecuta el siguiente comando:

```bash
yarn run start
```

Una vez hecho esto, tu instancia local de SOLmate debería estar en funcionamiento y lista para interactuar con la blockchain de Solana.
