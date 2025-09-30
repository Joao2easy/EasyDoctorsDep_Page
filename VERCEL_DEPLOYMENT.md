# Instruções para Deploy no Vercel

## Configurações Necessárias

### 1. Variáveis de Ambiente no Vercel
Configure as seguintes variáveis no painel do Vercel:

```
NEXT_PUBLIC_PLANS_URL=https://primary-teste-2d67.up.railway.app/webhook/45d535d6-149f-454d-9dec-1c6447787153/get_assinatura
NEXT_PUBLIC_CHECKOUT_URL=https://primary-teste-2d67.up.railway.app/webhook-test/Cadastro-EasyDoctors
```

### 2. Configurações do Build
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 3. Configurações de Runtime
- **Node.js Version**: 18.x (recomendado)

## Problemas Comuns e Soluções

### Problema: Página não renderiza no Vercel
**Solução**: 
1. Verifique se as variáveis de ambiente estão configuradas
2. Confirme que o build está passando sem erros
3. Verifique os logs de deploy no Vercel

### Problema: Erro de hidratação
**Solução**: 
- O componente já está envolvido em Suspense para resolver problemas de hidratação

### Problema: useSearchParams não funciona
**Solução**: 
- O componente está configurado para funcionar no lado do cliente com Suspense

## Teste Local vs Produção

### Local
```bash
npm run dev
# Acesse: http://localhost:3000/cadastro-dependentes?plano=fde207d4-fef1-4585-a285-c84507b85449&Customer_stripe=cus_T99QlSweM8fUqe
```

### Produção
```
https://easy-doctors-dep-page.vercel.app/cadastro-dependentes?plano=fde207d4-fef1-4585-a285-c84507b85449&Customer_stripe=cus_T99QlSweM8fUqe
```

## Debugging

1. Verifique os logs de build no Vercel
2. Use o console do navegador para ver erros JavaScript
3. Verifique se a URL está correta com os parâmetros necessários
