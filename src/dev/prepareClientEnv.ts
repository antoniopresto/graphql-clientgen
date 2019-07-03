import Adapter from 'enzyme-adapter-react-16';
import { configure } from 'enzyme';

require('jsdom-global/register');
configure({ adapter: new Adapter() });
