# Redesign do App CEP: Identidade Visual Protheus (Light Theme)

## 1. Objetivo
Alinhar a identidade visual do App CEP com o ERP Protheus, adotando um **Light Theme** profissional. Isso garantirá uma transição suave e coerente para os usuários que utilizam o CEP integrado ao sistema principal. O "Dark Mode" será totalmente removido para manter o padrão visual claro do Protheus.

## 2. Paleta de Cores Proposta (Baseada no TOTVS Protheus)

O Protheus utiliza predominantemente fundos brancos e cinzas claros, com a cor azul corporativa em destaques e elementos escuros para forte contraste tipográfico.

*   **Backgrounds:**
    *   `main`: `#F4F5F7` (Fundo geral da aplicação, cinza muito claro)
    *   `secondary`: `#FFFFFF` (Fundo de painéis, menus laterais e modais)
    *   `card`: `#FFFFFF` (Cards internos e áreas de gráfico)
*   **Primary (Azul TOTVS):**
    *   `DEFAULT`: `#00629B` (Botões principais, destaques, ícones ativos)
    *   `hover`: `#004F7C`
*   **Textos (Content):**
    *   `main`: `#1D2630` (Texto principal, quase preto)
    *   `secondary`: `#4A5568` (Textos secundários, legendas)
    *   `tertiary`: `#718096` (Placeholders, informações de menor peso)
*   **Bordas:**
    *   `main`: `#E2E8F0` (Linhas divisórias, grids)
    *   `input`: `#CBD5E0` (Bordas de formulário)

## 3. Arquivos a Serem Modificados

1.  **`tailwind.config.js`**:
    *   Substituir a paleta de cores escura atual pelas novas cores definidas acima.
2.  **`src/styles/globals.css`**:
    *   Atualizar o `body { background-color }` e cores de texto base, garantindo que não existam variáveis de CSS prendendo a aplicação ao dark mode.
3.  **`src/pages/apps/LancamentoCep.tsx`**:
    *   Remover classes estáticas como `bg-[#0F0F0F]`, `bg-[#161616]` e substituí-las pelas variáveis semânticas do Tailwind (`bg-background-main`, `bg-background-secondary`).
    *   Atualizar as configurações de cores na instância do `Chart.js` (textos, linhas de grid e legendas de anotações) para cores legíveis no modo claro.
4.  **`src/pages/apps/AppLayout.tsx` e `AdminLayout.tsx`**:
    *   Remover cores *hardcoded* (ex: o verde específico `bg-[#2D8C63]`) e forçar a utilização do azul primary.
    *   Ajustar contrastes de links do menu lateral.
5.  **Componentes UI (`Input`, `Modal`, `Button`, `Toast`)**:
    *   Revisar possíveis *hardcodes* de cores de fundo ou textos que foram feitos especificamente para contrastar com o tema escuro.

## 4. Risco e Prevenção de Quebra
- Faremos a mudança de paleta no arquivo de configuração do Tailwind (uma única fonte de verdade), o que espalhará a cor por 90% do projeto instantaneamente sem quebrar a UI.
- O maior ponto de atenção será o gráfico (Chart.js), pois ele utiliza configurações JS injetadas, não classes CSS. Iremos ajustá-lo com cuidado para que as linhas de controle (LSC/LIC) fiquem visíveis no fundo branco.
