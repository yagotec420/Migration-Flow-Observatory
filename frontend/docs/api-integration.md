# Integração com API

Base: `VITE_API_BASE_URL=http://localhost:3333/api/v1`. Todas as respostas seguem `{ success, data, meta, timestamp, version }`; `http.ts` desembrulha `data` e transforma respostas de erro em `ApiError`.

| Recurso | Endpoint | Uso |
| --- | --- | --- |
| Dashboard | `GET /dashboard` | carga inicial disponível para evolução |
| Países | `GET /countries?limit=100` | seletor de destino |
| Rotas | `GET /routes?type&year&limit=100` | ArcLayer e ranking |
| Estatísticas | `GET /statistics?countryId=c-ir` | saídas e retornos do Irã |
| Timeline | `GET /timeline?countryId=c-ir&granularity` | gráfico e controle temporal |

Limitações conhecidas do contrato atual: `startDate`/`endDate` são validados em `flows` e `timeline`, mas os repositórios não os aplicam; `timeline` também não filtra por `countryId`. `TRANSIT` aparece em `/routes`, mas não em `/flows`. Nenhuma dessas limitações bloqueia o dashboard e o frontend não as mascara com dados artificiais.
