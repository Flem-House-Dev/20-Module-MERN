// const { default: SearchBooks } = require('../../client/src/pages/SearchBooks');
const { User } = require('../models');

const resolvers = {
    Query: {
        me: async (parent, args, context) => {
        if (context.user) {
          return User.findOne({ _id: context.user._id }).populate('savedBooks');
        }
    
        throw new AuthenticationError('Not logged in');
        },
        searchBooks: async (_, { query }) => {
            try {
              const response = await fetch(`https://www.googleapis.com/books/v1/volumes?q=${encodeURIComponent(query)}`);
              
              if (!response.ok) {
                throw new Error('Failed to fetch from Google Books API');
              }
      
              const data = await response.json();
      
              // Map the Google Books API response to your GraphQL schema
              return data.items.map(book => ({
                bookId: book.id,
                authors: book.volumeInfo.authors || [],
                description: book.volumeInfo.description || '',
                title: book.volumeInfo.title,
                image: book.volumeInfo.imageLinks?.thumbnail || '',
                link: book.volumeInfo.infoLink || ''
              }));
            } catch (error) {
              console.error('Error searching books:', error);
              throw new Error('Failed to search books');
            }
          },
    },
    Mutation: {
        login: async (parent, { email, password }) => {
        const user = await User.findOne({ email });
    
        if (!user) {
            throw new AuthenticationError('Incorrect credentials');
        }
    
        const correctPw = await user.isCorrectPassword(password);
    
        if (!correctPw) {
            throw new AuthenticationError('Incorrect credentials');
        }
    
        const token = signToken(user);
        return { token, user };
        },
        addUser: async (parent, args) => {
        const user = await User.create(args);
        const token = signToken(user);
    
        return { token, user };
        },
        saveBook: async (parent, { input }, context) => {
        if (context.user) {
            const updatedUser = await User.findByIdAndUpdate(
            { _id: context.user._id },
            { $addToSet: { savedBooks: input } },
            { new: true, runValidators: true }
            ).populate('savedBooks');
    
            return updatedUser;
        }
    
        throw new AuthenticationError('You need to be logged in!');
        },
        removeBook: async (parent, { bookId }, context) => {
        if (context.user) {
            const updatedUser = await User.findOneAndUpdate(
            { _id: context.user._id },
            { $pull: { savedBooks: { bookId } } },
            { new: true }
            );
    
            return updatedUser;
        }
    
        throw new AuthenticationError('You need to be logged in!');
        },
    },
    };

module.exports = resolvers;