# Portal de Vidros Especiais - Frontend

Interface web responsiva para o sistema de gestão de pedidos de vidros especiais.

## Tecnologias

- React + Vite
- Tailwind CSS
- shadcn/ui
- React Router
- Lucide Icons

## Configuração no Netlify

1. Aceder a [netlify.com](https://netlify.com)
2. Criar novo site
3. Conectar ao repositório GitHub: `OLDmamorim/vidros-frontend`
4. Configurar build settings:
   - **Build command**: `pnpm install && pnpm run build`
   - **Publish directory**: `dist`
5. Adicionar variável de ambiente:
   - `VITE_API_URL` = URL do backend no Railway (ex: `https://vidros-backend-production.up.railway.app`)

## Funcionalidades

### Admin
- Gestão de lojas (criar, editar, eliminar)
- Gestão de utilizadores (criar, editar, eliminar)
- Dashboard com estatísticas

### Loja
- Criar novos pedidos de vidros
- Upload de fotos
- Visualizar pedidos próprios
- Ver atualizações visíveis

### Departamento
- Visualizar todos os pedidos
- Adicionar atualizações (visíveis/internas)
- Alterar status dos pedidos
- Registar contactos e informações

## Utilizadores de Teste

- **Admin**: admin@vidros.pt / admin123
- **Loja**: loja@vidros.pt / loja123
- **Departamento**: dept@vidros.pt / dept123

## Desenvolvimento Local

```bash
pnpm install
pnpm run dev
```

O frontend estará disponível em `http://localhost:5173`
