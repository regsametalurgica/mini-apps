# Documentação das Telas - Portal Mini Apps

Este documento descreve as principais telas desenvolvidas para a plataforma de Mini Apps, detalhando seus requisitos funcionais, estrutura e as tecnologias utilizadas.

## Tecnologias Globais Utilizadas
- **React 19**: Biblioteca principal para construção das interfaces.
- **Vite**: Ferramenta de build e servidor de desenvolvimento.
- **TypeScript**: Tipagem estática para maior segurança.
- **TailwindCSS**: Framework CSS utilitário para design moderno e responsivo.
- **React Router Dom**: Gerenciamento de rotas e navegação.
- **Bootstrap Icons**: Biblioteca de ícones padrão do projeto.

---

## 1. Tela de Login (`/login`)
- **Objetivo:** Autenticação segura de usuários da Regsa.
- **Funcionalidades:** Validação de campos, feedback de erro e redirecionamento pós-login.
- **Design:** Estilo minimalista com foco na usabilidade.

## 2. Dashboard Principal (`/`)
- **Objetivo:** Portal de entrada com acesso a todos os mini apps.
- **Funcionalidades:** 
  - Busca em tempo real de aplicativos.
  - Grade de aplicativos com controle de permissão.
  - Perfil do usuário com matrícula e cargo.
  - Modal de "Acesso Negado" para usuários sem permissão.

## 3. Painel Administrativo (`/admin`)
- **Objetivo:** Gestão centralizada de usuários e permissões.
- **Funcionalidades:**
  - **Usuários:** Lista completa com busca e edição de dados.
  - **Aplicações:** Cadastro e configuração do catálogo de apps.
  - **Permissões:** Vinculação dinâmica de usuários a aplicativos específicos.

## 4. Telas de Mini Apps
Cada mini app possui sua própria estrutura isolada, mas compartilhando o `AppLayout` para manter o cabeçalho e navegação consistentes.

- **Controle Estatístico (CEP):** Focado em medições técnicas e gráficos de controle.
- **Apoio RH:** Focado em processos internos de RH, auditoria de ponto e IA.

---
*Documentação atualizada em: 14/05/2026*
