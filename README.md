# Pulso

Painel web para organizar conteúdos, destinos e rotinas de publicação.

## Estado atual

Esta versão é uma base funcional de interface com armazenamento local no navegador. Permite criar e gerir conteúdos, organizar destinos de grupos manualmente, montar lotes de publicação, configurar uma rotina recorrente demonstrativa e acompanhar estados. **Não publica no Facebook nem adere a grupos automaticamente**: isso exige uma integração Meta autorizada, backend seguro, banco de dados e um worker alojado.

## Desenvolvimento

- Node.js 20+
- `npm install`
- `npm run dev`
- `npm run build`

## Próximas etapas para produção

1. Autenticação e banco de dados persistente.
2. Integração oficial Meta, após criar e configurar uma aplicação em Meta for Developers.
3. Backend para tokens OAuth e permissões; nunca colocar segredos no frontend.
4. Fila de tarefas e worker de execução em nuvem.
5. Verificação de permissões, limites e regras aplicáveis a cada destino.

Os intervalos automáticos nesta versão são uma configuração guardada localmente e uma demonstração da experiência de utilizador; não executam publicações em segundo plano.
