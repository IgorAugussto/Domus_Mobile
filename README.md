# Domus Mobile

Versão mobile (Expo / React Native) do [Domus](../../Domus_FrontEnd/domus-frontend), o controlador de finanças pessoais. Consome a mesma API Java usada pelo app web.

## Escopo desta versão (paridade com o web)

- Login e Registro
- Dashboard (KPIs, gráfico anual/mensal, despesas por categoria, alocação de investimentos, meta de gastos)
- Receitas (cadastrar / listar / editar / excluir)
- Despesas (cadastrar / listar / editar / excluir)
- Investimentos (cadastrar / listar / editar / excluir)
- Pagamentos (navegação por mês, filtro por status, marcar pago/pendente, pagar todos do mês)
- Importar Extrato (CSV/OFX/PDF via `expo-document-picker`, com polling de status do job assíncrono), integrado na tela de Despesas

## Rodando localmente

1. Instale as dependências:

   ```bash
   npm install
   ```

2. Configure a URL da API em `.env` (`EXPO_PUBLIC_API_URL`):
   - **iOS Simulator**: `http://localhost:8080/api` funciona normalmente.
   - **Android Emulator**: use `http://10.0.2.2:8080/api` (o emulador não enxerga `localhost` da máquina host).
   - **Dispositivo físico via Expo Go**: use o IP da sua máquina na rede local, ex: `http://192.168.0.10:8080/api`.

3. Suba o backend Java (mesma API do `domus-frontend`).

4. Inicie o app:

   ```bash
   npx expo start
   ```

## Autenticação

A sessão usa cookie HttpOnly (`POST /auth/login`, `GET /auth/me`), igual ao app web — sem token manual no client. O stack de rede nativo do iOS/Android mantém o cookie jar automaticamente, então deve funcionar sem biblioteca extra. **Ainda não foi validado em emulador/dispositivo real** (ambiente de desenvolvimento sem simulador disponível) — ao testar, confirme que login → fechar o app → reabrir mantém a sessão. Se a sessão não persistir, o fallback é a lib `@react-native-cookies/cookies`.

## Limitações conhecidas desta primeira versão

- Campos de data são inputs de texto no formato `AAAA-MM-DD` (não há date picker nativo integrado ainda).
- A meta de gastos é salva e exibida como texto acima do gráfico, mas não desenha uma linha de referência sobre o gráfico (diferente do web, que usa `ReferenceLine` do Recharts).
- Seleção de mês no gráfico anual é feita por uma lista de chips roláveis abaixo do gráfico, em vez de clicar diretamente no eixo X.

## Estrutura

Mesma organização conceitual do `domus-frontend` (`lib/api.ts`, `services/*`, `context/*`, `utils/labels/*`), adaptada para Expo Router:

- `app/(auth)/` — login e registro (rotas públicas)
- `app/(tabs)/` — Dashboard, Receitas, Despesas, Investimentos, Pagamentos (rotas protegidas)
- `components/ui/` — primitivos de UI com NativeWind (Card, Button, Input, Label, Select, TextArea)
