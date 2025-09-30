# Instruções para Deploy no Vercel

## Configurações Necessárias

### 1. Variáveis de Ambiente no Vercel
Configure as seguintes variáveis no painel do Vercel:

```
NEXT_PUBLIC_PLANS_URL=https://primary-teste-2d67.up.railway.app/webhook/45d535d6-149f-454d-9dec-1c6447787153/get_assinatura
NEXT_PUBLIC_CHECKOUT_URL=https://primary-teste-2d67.up.railway.app/webhook-test/Cadastro-EasyDoctors
NEXT_PUBLIC_DEPENDENTES_WEBHOOK_URL=https://primary-teste-2d67.up.railway.app/webhook-test/finalizar-cadastros
```

### 2. Configurações do Build
- **Framework Preset**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### 3. Configurações de Runtime
- **Node.js Version**: 18.x (recomendado)

### 4. Arquivos Removidos
- ❌ `vercel.json` - removido (não necessário para Next.js App Router)
- ✅ `next.config.js` - simplificado para compatibilidade com Vercel

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

### Problema: CORS - "Access-Control-Allow-Origin" header is missing
**Solução**: 
- ✅ Implementado proxy local em `/api/cadastro-dependentes`
- O frontend agora chama a API local que faz a requisição para o servidor externo
- Isso evita problemas de CORS pois a requisição é feita server-side

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

### Debug do POST de Dependentes

Para debugar o envio dos dependentes:

1. **Abra o Console do Navegador** (F12)
2. **Preencha e envie o formulário**
3. **Verifique os logs**:
   - `Payload enviado:` - mostra os dados que estão sendo enviados
   - `Resposta da API:` - mostra a resposta do servidor
   - `Erro ao enviar formulário:` - mostra erros se houver

### Estrutura do Payload Enviado

```json
{
  "titular": {
    "tipoDocumento": 0,
    "numeroDocumento": "12345678901",
    "genero": "male"
  },
  "dependentes": [
    {
      "nome": "João Silva",
      "telefone": "+5511999999999",
      "codigoPais": "BR",
      "email": "joao@email.com",
      "genero": "male",
      "tipoDocumento": 0,
      "numeroDocumento": "98765432100"
    }
  ],
  "plano": "Plano 1 pessoa: $29,90",
  "quantidadeDependentes": 1,
  "customerStripe": "cus_T99QlSweM8fUqe"
}
```

### Verificação de Variáveis de Ambiente

Para verificar se as variáveis estão configuradas corretamente, adicione este código temporário no início da função `handleSubmit`:

```javascript
console.log('Webhook URL:', process.env.NEXT_PUBLIC_DEPENDENTES_WEBHOOK_URL);
```
