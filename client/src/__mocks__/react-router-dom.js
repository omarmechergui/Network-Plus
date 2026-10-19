const React = require('react');

module.exports = {
  Link: ({ to, children, ...props }) => React.createElement('a', { href: to, ...props }, children),
  NavLink: ({ to, children, ...props }) => React.createElement('a', { href: to, ...props }, children),
  useNavigate: () => () => {},
  useLocation: () => ({ pathname: '/' }),
  useParams: () => ({}),
};
