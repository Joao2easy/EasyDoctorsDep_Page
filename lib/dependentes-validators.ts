import { z } from "zod";

// Função para validar CPF
const validateCPF = (cpf: string): boolean => {
  // Remove caracteres não numéricos
  const cleanCPF = cpf.replace(/\D/g, '');
  
  // Verifica se tem 11 dígitos
  if (cleanCPF.length !== 11) return false;
  
  // Verifica se todos os dígitos são iguais
  if (/^(\d)\1{10}$/.test(cleanCPF)) return false;
  
  // Validação do primeiro dígito verificador
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(cleanCPF[i]) * (10 - i);
  }
  let remainder = sum % 11;
  let firstDigit = remainder < 2 ? 0 : 11 - remainder;
  
  if (parseInt(cleanCPF[9]) !== firstDigit) return false;
  
  // Validação do segundo dígito verificador
  sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(cleanCPF[i]) * (11 - i);
  }
  remainder = sum % 11;
  let secondDigit = remainder < 2 ? 0 : 11 - remainder;
  
  return parseInt(cleanCPF[10]) === secondDigit;
};

// Função para validar telefone E.164
const validatePhone = (phone: string): boolean => {
  if (!phone) return false;
  
  // Remove caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Verifica se começa com +55 (Brasil) ou +1 (EUA)
  if (cleanPhone.startsWith('55')) {
    // Brasil: +55 + DDD + número (11 dígitos total)
    return cleanPhone.length === 13; // +55 + 11 dígitos
  } else if (cleanPhone.startsWith('1')) {
    // EUA: +1 + número (10 dígitos total)
    return cleanPhone.length === 11; // +1 + 10 dígitos
  }
  
  return false;
};

// Schema para pessoa (dependente)
export const pessoaSchema = z.object({
  nome: z.string()
    .min(2, "Nome deve ter pelo menos 2 caracteres")
    .max(100, "Nome muito longo"),
  telefone: z.string()
    .min(1, "Telefone obrigatório")
    .refine(validatePhone, "Telefone inválido (formato: +55 11 99999-9999)"),
  codigoPais: z.string()
    .min(1, "Código do país obrigatório"),
  email: z.string()
    .email("Email inválido")
    .max(255, "Email muito longo"),
  genero: z.string()
    .min(1, "Gênero obrigatório"),
  tipoDocumento: z.coerce.number()
    .min(0)
    .max(3, "Tipo de documento inválido"),
  numeroDocumento: z.string()
    .min(1, "Número do documento obrigatório")
    .max(50, "Número do documento muito longo")
    .refine((value) => {
      // Buscar o tipoDocumento do mesmo objeto
      const tipoDocumento = 0; // Default para CPF
      if (tipoDocumento === 0) { // CPF
        return validateCPF(value);
      }
      return true;
    }, "CPF inválido"),
});

// Schema para titular (apenas 3 campos)
export const titularSchema = z.object({
  tipoDocumento: z.coerce.number()
    .min(0)
    .max(3, "Tipo de documento inválido"),
  numeroDocumento: z.string()
    .min(1, "Número do documento obrigatório")
    .max(50, "Número do documento muito longo")
    .refine((value) => {
      // Buscar o tipoDocumento do mesmo objeto
      const tipoDocumento = 0; // Default para CPF
      if (tipoDocumento === 0) { // CPF
        return validateCPF(value);
      }
      return true;
    }, "CPF inválido"),
  genero: z.string()
    .min(1, "Gênero obrigatório"),
});

// Schema para dependente
export const dependenteSchema = pessoaSchema;

// Schema principal do formulário
export const formularioSchema = z.object({
  titular: titularSchema,
  dependentes: z.array(dependenteSchema),
  plano: z.string().optional(),
});

// Tipos TypeScript
export type TitularData = z.infer<typeof titularSchema>;
export type DependenteData = z.infer<typeof dependenteSchema>;
export type FormularioData = z.infer<typeof formularioSchema>;

// Opções disponíveis
export const tiposDocumento = [
  { value: 0, label: "CPF" },
  { value: 1, label: "SSN" },
  { value: 2, label: "ITIN" },
  { value: 3, label: "PASSAPORTE" }
];

export const paises = [
  { value: "BR", label: "Brasil", codigo: "+55", bandeira: "🇧🇷" },
  { value: "US", label: "Estados Unidos", codigo: "+1", bandeira: "🇺🇸" }
];

export const generos = [
  { value: "male", label: "Masculino" },
  { value: "female", label: "Feminino" }
];

// Funções de formatação
export const formatTelefone = (value: string) => {
  return value.replace(/\D/g, '').slice(0, 11);
};

export const formatDocumento = (value: string, tipoDocumento: number) => {
  const cleaned = value.replace(/\D/g, '');
  switch (tipoDocumento) {
    case 0: return cleaned.slice(0, 11); // CPF
    case 1: return cleaned.slice(0, 9);  // SSN
    case 2: return cleaned.slice(0, 9);  // ITIN
    case 3: return value.slice(0, 20);   // PASSAPORTE
    default: return cleaned.slice(0, 20);
  }
};

export const getCodigoPais = (paisValue: string) => {
  const pais = paises.find(p => p.value === paisValue);
  return pais ? pais.codigo : "+55";
};
