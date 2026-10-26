import {makeRequestHandler} from '../../server/request';
import {requestStore} from '../../server/store';
export default makeRequestHandler(requestStore,()=>process.env.RATE_LIMIT_SECRET||'');
