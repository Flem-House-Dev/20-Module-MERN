import { gql } from '@apollo/client';

export const searchGoogleBooks = (query) => {
    return client.query({
      query: gql`
        query SearchBooks($query: String!) {
          searchBooks(query: $query) {
            title
            author
            description
          }
        }
      `,
      variables: { query },
    });
  };

  export const SEARCH_BOOKS = gql`
    query searchBooks($query: String!) {
        searchBooks(query: $query) {
        id
        title
        author
        }
    }
`;

export const GET_ME = gql`
  query me {
    me {
      _id
      username
      email
      savedBooks {
        bookId
        authors
        description
        title
        image
        link
      }
    }
  }
`;