import { publicProcedure } from '../../../create-context';
import { exportAllData } from '../../../../db';

export default publicProcedure
  .query(async () => {
    console.log('[API] Exporting all data for admin');
    const data = exportAllData();
    return data;
  });
