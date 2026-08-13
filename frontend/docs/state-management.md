# Estado

React Query possui o estado de servidor: dashboard, países, rotas, estatísticas e timeline. Cache padrão de 30 segundos; KPIs são revalidados a cada minuto.

Zustand mantém apenas `destinationId`, `routeType`, `year`, granularidade, mês selecionado e play/pause. Filtros de rota são enviados a `/routes`; a seleção de destino é aplicada sobre o conjunto retornado porque o contrato atual de `/routes` não oferece `destinationCountryId`.
