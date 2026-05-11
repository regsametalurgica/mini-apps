# Documentação das Telas - Projeto Mini Apps

Este documento descreve as principais telas desenvolvidas para a plataforma de Mini Apps, detalhando seus requisitos funcionais, estrutura e as tecnologias utilizadas.

## Tecnologias Globais Utilizadas
- **React (v18+)**: Biblioteca principal para construção das interfaces.
- **Vite**: Ferramenta de build e servidor de desenvolvimento super rápido.
- **TypeScript**: Adiciona tipagem estática ao JavaScript, garantindo maior segurança e previsibilidade no código.
- **TailwindCSS**: Framework utilitário de CSS para estilização rápida e responsiva.
- **React Router Dom**: Gerenciamento de rotas e navegação entre as telas.
- **Lucide React**: Biblioteca de ícones.

---

## 1. Tela de Login (`/login`)

### Requisitos Funcionais
- Autenticação de usuários.
- Validação visual de campos (e-mail e senha).
- Feedback visual durante a tentativa de login (loading state).
- Redirecionamento automático para o Dashboard após o login bem-sucedido.

### Estrutura
- Formulário centralizado com design moderno (Glassmorphism ou estilo minimalista limpo).
- Campos de entrada para "E-mail Corporativo" e "Senha".
- Botão de ação primária para "Entrar".

---

## 2. Dashboard Principal (`/`)

### Requisitos Funcionais
- Ponto de entrada após o login.
- Exibição de um cabeçalho (Header) com o perfil do usuário logado e opção de logout.
- Barra de pesquisa em tempo real para filtrar os mini-apps disponíveis.
- Grade (Grid) interativa exibindo os cartões (Cards) dos mini-apps que o usuário tem permissão para acessar.
- Controle de acesso baseado em permissões (apps sem permissão exibem modal de "Acesso Negado").
- Navegação dinâmica para o mini-app selecionado.

### Estrutura
- **Header**: Barra superior com logotipo, campo de busca e menu do usuário.
- **App Grid**: Área de conteúdo principal exibindo os módulos como `Prints`, `CEP`, `Admin`, etc.
- **Feedback Modal**: Modal exibido ao tentar acessar um app bloqueado.

---

## 3. Painel Administrativo (`/admin`)

### Requisitos Funcionais
- Área restrita para administração do sistema.
- Layout próprio com navegação lateral (Sidebar) dedicada à administração.
- Gerenciamento de usuários e aplicações.

### Estrutura
- **AdminLayout**: Container que envolve as páginas administrativas, fornecendo a barra lateral de navegação e o cabeçalho.
- **Página de Usuários (`/admin/users`)**: Tabela ou lista para visualizar, editar permissões e gerenciar os usuários do sistema.
- **Página de Aplicações (`/admin/apps`)**: Gerenciamento do catálogo de mini-apps disponíveis no portal.

---

## 4. Telas de Mini Apps (Ex: Printers - `/apps/printers`)

### Requisitos Funcionais
- Telas específicas para cada funcionalidade de negócio.
- O aplicativo de "Printers" (Impressoras) serve como exemplo de um mini-app funcional dentro do ecossistema.
- Deve conter botão para voltar ao Dashboard principal de forma intuitiva.

### Estrutura
- Layout focado na tarefa do mini-app (ex: listagem de impressoras, envio de arquivos, etc).
- Compartilha a identidade visual global do projeto, mas possui contexto isolado.
