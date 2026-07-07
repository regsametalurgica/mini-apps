# Plano de Refatoração: De Hub de Mini Apps para App Exclusivo CEP

## 1. Visão Geral
Transformar o projeto atual, que atuava como um hub com vários aplicativos, em um sistema dedicado exclusivamente ao **Controle Estatístico de Processo (CEP)**. O objetivo é simplificar o fluxo: **Login > Inserir OP > Tela do CEP**.

## 2. O que será mantido
*   **Sistema de Login e Sessão:** O fluxo de autenticação e divisão de papéis (`admin` e `user`) será preservado.
*   **Controle CEP (`LancamentoCep.tsx`):** A lógica, os gráficos, a inserção de dados e os menus laterais (direito e esquerdo) serão mantidos exatamente como estão.
*   **Layouts Essenciais:** `AppLayout.tsx` (para cabeçalho de usuário) e `AdminLayout.tsx` (para painel administrativo).

## 3. O que será removido (Limpeza de Código)
*   **Dashboard Hub (`Dashboard.tsx`):** A tela onde o usuário escolhia qual mini app abrir será deletada.
*   **Outros Mini Apps:** Serão excluídos da pasta `src/pages/apps/`:
    *   `ApoioRh.tsx`
    *   `GeradorEtiquetas.tsx`
    *   `Printers.tsx`
    *   `SobreApp.tsx`
*   **Gerenciamento de Apps no Admin:** A tela `Applications.tsx` (Permissões de Aplicativos) será removida do painel de administração, já que o sistema terá apenas uma função.
*   **Rotas e Links Obsoletos:** Remoção de todas as rotas em `App.tsx` que apontavam para os apps descontinuados.

## 4. Passo a Passo da Implementação

### Passo 1: Limpeza Física de Arquivos
*   Deletar `src/pages/Dashboard.tsx`.
*   Deletar componentes não utilizados de `src/pages/apps/`.
*   Deletar `src/pages/admin/Applications.tsx`.

### Passo 2: Atualização de Rotas (`src/app/App.tsx`)
*   Fazer com que a rota principal de usuários logados aponte diretamente para o componente `LancamentoCep`, encapsulado no layout padrão.
*   Remover referências de roteamento aos apps antigos.
*   Remover rota `/admin/aplicacoes`.

### Passo 3: Ajustes nos Layouts e Navegação
*   **`AppLayout.tsx`:** Remover o botão de "Voltar para o Dashboard", já que a aplicação principal agora é o CEP.
*   **`AdminLayout.tsx`:** Remover do menu lateral o item "Permissões".
*   Verificar o estado inicial do `cepStore.ts` e `authStore.ts` para que o Modal de Inserção de OP apareça adequadamente na primeira tela após o login.

### Passo 4: Verificação Final
*   Testar login com conta comum. Deve abrir o Modal de CEP e mostrar o header com nome do usuário e botão "Histórico".
*   Testar login com conta admin e acesso ao painel de administração.
*   Garantir a limpeza das importações inutilizadas para manter o código leve.
