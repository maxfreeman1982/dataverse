import { NextRequest, NextResponse } from 'next/server';
import { ApolloClient, InMemoryCache, HttpLink, gql } from '@apollo/client';
import { renderToStream } from '@react-pdf/renderer';
import { FormulaPDF } from '@/components/pdf/FormulaPDF';
import { GET_FORMULA_BY_ID } from '@/graphql/perfume';

// Create Apollo Client for server-side requests
const createApolloClient = () => {
  return new ApolloClient({
    link: new HttpLink({
      uri: process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:3001/graphql',
      fetch,
    }),
    cache: new InMemoryCache(),
  });
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const formulaId = params.id;

    // Fetch formula data from GraphQL API
    const client = createApolloClient();
    const { data } = await client.query({
      query: GET_FORMULA_BY_ID,
      variables: { id: formulaId },
    });

    if (!data?.getFormulaById) {
      return NextResponse.json(
        { error: 'Formula not found' },
        { status: 404 }
      );
    }

    const formula = data.getFormulaById;

    // Generate PDF
    const pdfStream = await renderToStream(<FormulaPDF formula={formula} />);

    // Convert stream to buffer
    const chunks: Uint8Array[] = [];
    for await (const chunk of pdfStream) {
      chunks.push(chunk);
    }
    const buffer = Buffer.concat(chunks);

    // Return PDF as download
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="formula-${formula.name.replace(/[^a-zA-Z0-9]/g, '-')}.pdf"`,
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return NextResponse.json(
      { error: 'Failed to generate PDF', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
