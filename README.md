# Gerenciador de Tarefas com Chatbot

Um chatbot integrado a um sistema de gerenciamento de tarefas construído com React e Tailwind CSS.

## Descrição
Este projeto combina uma interface de chat com um assistente de IA com um quadro de gerenciamento de tarefas. Os usuários podem:
- Conversar com um assistente de IA
- Criar e gerenciar tarefas
- Acompanhar o progresso das tarefas
- Alternar entre as vistas de chat e tarefas

## Recursos

### Interface do Chat
- Enviar mensagens para um assistente de IA
- Visualizar histórico de conversas
- Tratamento de erros para chamadas de API

### Gerenciamento de Tarefas
- Criar novas tarefas
- Atualizar tarefas existentes
- Excluir tarefas
- Acompanhar status das tarefas (TO-DO, DOING, DONE)

## Configuração

1. Clonar o repositório
2. Instalar as dependências:
   ```bash
   npm install
   ```
3. Configurar o Tailwind CSS, se não estiver configurado
4. Executar o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

## Uso

1. Abrir a aplicação
2. Usar os botões de guias para alternar entre as vistas de Chat e Tarefas
3. Interagir com o chat ou gerenciar as tarefas conforme necessário

## Problemas Conhecidos

- Não há autenticação de usuário implementada
- O sistema de gerenciamento de tarefas é local à sessão do navegador
- Ao trocar de tabs o chat é resetado
