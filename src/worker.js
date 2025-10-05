// Cloudflare Worker for Shopify Preorder Dashboard
export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    
    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // Handle preflight requests
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }

    // Serve the main dashboard page
    if (url.pathname === '/' || url.pathname === '/index.html') {
      // In production, you would serve this from Cloudflare Pages
      // For now, we'll return a simple redirect to the HTML file
      return new Response(null, {
        status: 302,
        headers: {
          'Location': '/index.html',
          ...corsHeaders
        }
      });
    }

    // API Routes
    if (url.pathname.startsWith('/api/')) {
      return handleApiRequest(request, env, corsHeaders);
    }

    return new Response('Not Found', { status: 404, headers: corsHeaders });
  }
};

async function handleApiRequest(request, env, corsHeaders) {
  const url = new URL(request.url);
  
  try {
    if (url.pathname === '/api/products') {
      return await handleProducts(request, env, corsHeaders);
    }
    
    if (url.pathname === '/api/search-suggestions') {
      return await handleSearchSuggestions(request, env, corsHeaders);
    }
    
    if (url.pathname === '/api/update-metafields') {
      return await handleUpdateMetafields(request, env, corsHeaders);
    }
    
    return new Response('API endpoint not found', { status: 404, headers: corsHeaders });
  } catch (error) {
    console.error('API Error:', error);
    return new Response(JSON.stringify({ error: 'Internal Server Error' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}

async function handleProducts(request, env, corsHeaders) {
  const url = new URL(request.url);
  const searchQuery = url.searchParams.get('search') || '';
  
  const query = `
    query getProductsWithPreorderMetafields {
      products(first: 50${searchQuery ? `, query: "${searchQuery}"` : ''}) {
        edges {
          node {
            id
            title
            variants(first: 20) {
              edges {
                node {
                  id
                  title
                  inventoryQuantity
                  isPreorder: metafield(namespace: "custom", key: "is_preorder") { value }
                  preorderLimit: metafield(namespace: "custom", key: "preorder_limit") { value }
                }
              }
            }
          }
        }
      }
    }
  `;

  const response = await fetch(`${env.SHOPIFY_STORE_URL}/admin/api/2023-10/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': env.SHOPIFY_ADMIN_API_ACCESS_TOKEN,
    },
    body: JSON.stringify({ query }),
  });

  const jsonResponse = await response.json();
  
  if (jsonResponse.errors) {
    return new Response(JSON.stringify({ error: 'Error fetching data from Shopify', details: jsonResponse.errors }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
  
  const formattedProducts = jsonResponse.data.products.edges.map(productEdge => ({
    id: productEdge.node.id,
    title: productEdge.node.title,
    variants: productEdge.node.variants.edges.map(variantEdge => ({
      id: variantEdge.node.id,
      title: variantEdge.node.title,
      inventoryQuantity: variantEdge.node.inventoryQuantity,
      isPreorder: variantEdge.node.isPreorder,
      preorderLimit: variantEdge.node.preorderLimit,
      sold: 0
    }))
  }));

  return new Response(JSON.stringify(formattedProducts), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}

async function handleSearchSuggestions(request, env, corsHeaders) {
  const url = new URL(request.url);
  const searchQuery = url.searchParams.get('q') || '';
  
  if (searchQuery.length < 2) {
    return new Response(JSON.stringify([]), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }

  const query = `
    query getProductSuggestions {
      products(first: 10, query: "${searchQuery}") {
        edges {
          node {
            id
            title
            variants(first: 1) {
              edges {
                node {
                  id
                }
              }
            }
          }
        }
      }
    }
  `;

  const response = await fetch(`${env.SHOPIFY_STORE_URL}/admin/api/2023-10/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Access-Token': env.SHOPIFY_ADMIN_API_ACCESS_TOKEN,
    },
    body: JSON.stringify({ query }),
  });

  const jsonResponse = await response.json();
  
  if (jsonResponse.errors) {
    return new Response(JSON.stringify({ error: 'Error fetching search suggestions', details: jsonResponse.errors }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
  
  const suggestions = jsonResponse.data.products.edges.map(productEdge => ({
    id: productEdge.node.id,
    title: productEdge.node.title,
    variants: productEdge.node.variants.edges.length
  }));

  return new Response(JSON.stringify(suggestions), {
    headers: { 'Content-Type': 'application/json', ...corsHeaders }
  });
}

async function handleUpdateMetafields(request, env, corsHeaders) {
  try {
    const changes = await request.json();
    console.log('Received changes:', JSON.stringify(changes, null, 2));
    
    const metafieldsToSet = [];
    changes.forEach(item => {
      if (item.hasOwnProperty('isPreorder')) {
        metafieldsToSet.push({
          ownerId: item.id,
          namespace: "custom",
          key: "is_preorder",
          type: "boolean",
          value: String(item.isPreorder)
        });
      }
      if (item.hasOwnProperty('preorderLimit')) {
        metafieldsToSet.push({
          ownerId: item.id,
          namespace: "custom",
          key: "preorder_limit",
          type: "integer",
          value: String(item.preorderLimit)
        });
      }
    });
    
    console.log('Metafields to set:', JSON.stringify(metafieldsToSet, null, 2));

  const mutation = `
    mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
      metafieldsSet(metafields: $metafields) {
        metafields {
          id
        }
        userErrors {
          field
          message
        }
      }
    }
  `;

    const response = await fetch(`${env.SHOPIFY_STORE_URL}/admin/api/2023-10/graphql.json`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Access-Token': env.SHOPIFY_ADMIN_API_ACCESS_TOKEN,
      },
      body: JSON.stringify({ 
        query: mutation,
        variables: { metafields: metafieldsToSet }
      }),
    });
    
    console.log('Shopify API response status:', response.status);
    const jsonResponse = await response.json();
    console.log('Shopify API response:', JSON.stringify(jsonResponse, null, 2));

    if (jsonResponse.data?.metafieldsSet?.userErrors?.length > 0) {
      console.error('Shopify API errors:', jsonResponse.data.metafieldsSet.userErrors);
      return new Response(JSON.stringify({ 
        success: false,
        error: 'Error updating metafields', 
        details: jsonResponse.data.metafieldsSet.userErrors 
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...corsHeaders }
      });
    }

    return new Response(JSON.stringify({ 
      success: true, 
      message: 'Metafields updated successfully', 
      details: jsonResponse 
    }), {
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  } catch (error) {
    console.error('Error in handleUpdateMetafields:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: 'Internal server error', 
      details: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders }
    });
  }
}