// Set flag for React 19 testing environment before importing React
global.IS_REACT_ACT_ENVIRONMENT = true;

import React, { act } from 'react';
import ReactDOM from 'react-dom/client';
import Post from './Post';

// Mock Findpost child component to keep unit test isolated
jest.mock('./Findpost', () => {
  return function MockFindpost({ post }) {
    return (
      <div data-testid="mock-post" id={`post-${post._id}`}>
        <h3>{post.description}</h3>
        <span>By {post.userId?.username}</span>
      </div>
    );
  };
});

// Helper: default user data response for /api/users/getuser
const mockUserResponse = () =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve({ user: { _id: 'currentUser', username: 'testuser', following: [] } }),
  });

describe('Post Component - Frontend Get Posts Feed', () => {
  let container;
  let root;

  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    container = document.createElement('div');
    document.body.appendChild(container);
    root = ReactDOM.createRoot(container);
  });

  afterEach(async () => {
    if (root) {
      await act(async () => {
        root.unmount();
      });
    }
    if (container) {
      container.remove();
      container = null;
    }
  });

  test('renders loading spinner while fetching posts', async () => {
    global.fetch = jest.fn((url) => {
      if (url.includes('/api/users/getuser')) return mockUserResponse();
      return new Promise(() => {}); // posts never resolve → stays loading
    });

    await act(async () => {
      root.render(<Post />);
    });

    expect(container.textContent).toContain('Loading feed...');
  });

  test('successfully fetches and renders post cards', async () => {
    const mockPosts = [
      {
        _id: 'post1',
        description: 'First test post',
        userId: { _id: 'u1', username: 'alice', profilePicture: '' },
        picture: 'https://example.com/image1.jpg',
        likes: [],
        comments: [],
        shares: 0,
        createdAt: '2026-10-17T10:00:00Z',
      },
      {
        _id: 'post2',
        description: 'Second test post',
        userId: { _id: 'u2', username: 'bob', profilePicture: '' },
        picture: '',
        likes: [],
        comments: [],
        shares: 2,
        createdAt: '2026-10-17T11:00:00Z',
      },
    ];

    global.fetch = jest.fn((url) => {
      if (url.includes('/api/users/getuser')) return mockUserResponse();
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve(mockPosts),
      });
    });

    await act(async () => {
      root.render(<Post />);
    });

    // Verify fetched endpoint and headers
    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:5000/api/posts',
      expect.objectContaining({
        headers: expect.any(Object),
      })
    );

    // Verify posts rendered in container
    expect(container.textContent).toContain('First test post');
    expect(container.textContent).toContain('Second test post');
    expect(container.querySelectorAll('[data-testid="mock-post"]').length).toBe(2);
  });

  test('displays empty state when no posts are returned', async () => {
    global.fetch = jest.fn((url) => {
      if (url.includes('/api/users/getuser')) return mockUserResponse();
      return Promise.resolve({
        ok: true,
        json: () => Promise.resolve([]),
      });
    });

    await act(async () => {
      root.render(<Post />);
    });

    expect(container.textContent).toContain('No posts yet');
    expect(container.textContent).toContain('Create Post');
  });

  test('displays error message and retry button when fetch fails', async () => {
    global.fetch = jest.fn((url) => {
      if (url.includes('/api/users/getuser')) return mockUserResponse();
      return Promise.resolve({
        ok: false,
        json: () => Promise.resolve({ message: 'Internal Server Error' }),
      });
    });

    await act(async () => {
      root.render(<Post />);
    });

    expect(container.textContent).toContain('Unable to load posts');
    expect(container.textContent).toContain('Internal Server Error');
    expect(container.textContent).toContain('Try Again');
  });
});
