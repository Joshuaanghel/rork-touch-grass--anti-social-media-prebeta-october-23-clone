import { publicProcedure } from '../../../create-context';
import { getUserCount } from '../../../../db';

export default publicProcedure
  .query(async () => {
    const count = getUserCount();
    console.log('[API] Current user count:', count);
    return { count };
  });
