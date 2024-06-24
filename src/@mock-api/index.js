import api from './api';
import './data/apps.chat';
import './data/apps.contacts';
import './data/apps.events';
import './data/apps.mailbox';
import './data/apps.tasks';
import './data/datatable';
import './data/notifications';
import './data/products';
import './data/users';
import './data/customers';
import './data/bom';
import './data/rm';

api.onAny().passThrough();
