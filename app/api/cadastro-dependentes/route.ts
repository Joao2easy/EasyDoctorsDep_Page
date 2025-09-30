import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    console.log('📦 Dados recebidos no proxy:', body);
    
    // URL do webhook de dependentes
    const webhookUrl = process.env.NEXT_PUBLIC_DEPENDENTES_WEBHOOK_URL || 
                      'https://primary-teste-2d67.up.railway.app/webhook-test/finalizar-cadastros';
    
    console.log('🌐 Fazendo requisição para:', webhookUrl);
    
    // Fazer a requisição para a API externa
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(body),
    });
    
    console.log('📡 Status da resposta:', response.status);
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ Erro na API:', response.status, errorText);
      
      return NextResponse.json(
        { 
          success: false, 
          error: `Erro na API: ${response.status} - ${errorText}` 
        },
        { status: response.status }
      );
    }
    
    const data = await response.json();
    console.log('✅ Resposta da API:', data);
    
    return NextResponse.json(data);
    
  } catch (error) {
    console.error('❌ Erro no proxy:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erro interno do servidor' 
      },
      { status: 500 }
    );
  }
}
