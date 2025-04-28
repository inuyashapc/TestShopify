export async function getAllProduct(graphql) {
  const response = await graphql(`
    query ProductWithShopify {
      products(first: 8) {
        edges {
          node {
            id
            title
            media(first: 2) {
              edges {
                node {
                  id
                  preview {
                    image {
                      url
                    }
                  }
                }
              }
            }
            variants(first: 250) {
              nodes {
                id
                title
                price
              }
            }
            tags
          }
          cursor
          __typename
        }
      }
    }
  `);
  const res = await response.json();

  // const {
  //   data: { products },
  // } = await response.json();
  const { products } = res.data;

  return {
    products,
  };
}
export async function getAllProductWithPagination(
  graphql,
  { first = null, after = null, before = null, last = null },
) {
  const variables = { first, after, before, last };

  const response = await graphql(
    `
      query ProductWithShopify(
        $first: Int
        $after: String
        $before: String
        $last: Int
      ) {
        products(first: $first, after: $after, before: $before, last: $last) {
          edges {
            node {
              id
              title
              media(first: 2) {
                edges {
                  node {
                    id
                    preview {
                      image {
                        url
                      }
                    }
                  }
                }
              }
              variants(first: 10) {
                nodes {
                  id
                  title
                  price
                }
              }
              tags
            }
            cursor
          }
          pageInfo {
            hasNextPage
            hasPreviousPage
            startCursor
            endCursor
          }
        }
      }
    `,
    { variables },
  );

  const {
    data: { products },
  } = await response.json();

  return { products };
}

export async function addTag(graphql, id, tag) {
  const response = await graphql(
    `
      mutation addTagProducts($id: ID!, $tags: [String!]!) {
        tagsAdd(id: $id, tags: $tags) {
          node {
            id
            ... on Product {
              id
              title
              tags
            }
          }
          userErrors {
            field
            message
          }
        }
      }
    `,
    { variables: { id, tags: [tag] } },
  );
  const res = await response.json();
  return res.data.tagsAdd;
}
