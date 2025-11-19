"""
Supabase client for database operations
"""
import os
import logging
from supabase import create_client, Client
from datetime import datetime

logger = logging.getLogger(__name__)

class SupabaseClient:
    def __init__(self):
        url = os.getenv('SUPABASE_URL')
        key = os.getenv('SUPABASE_SERVICE_KEY') or os.getenv('SUPABASE_KEY')
        
        if not url or not key:
            logger.warning("⚠️  Supabase credentials not found")
            self.client = None
        else:
            self.client: Client = create_client(url, key)
            logger.info("✅ Supabase client initialized")
    
    def update_history(self, history_id, updates):
        """Update download history"""
        try:
            if not self.client:
                logger.warning("Supabase client not initialized")
                return None
            
            updates['updated_at'] = datetime.utcnow().isoformat()
            
            result = self.client.table('download_history')\
                .update(updates)\
                .eq('id', history_id)\
                .execute()
            
            logger.info(f"✅ Updated history {history_id}")
            return result.data
            
        except Exception as e:
            logger.error(f"❌ Error updating history: {str(e)}")
            raise
    
    def get_history(self, history_id):
        """Get download history by ID"""
        try:
            if not self.client:
                logger.warning("Supabase client not initialized")
                return None
            
            result = self.client.table('download_history')\
                .select('*')\
                .eq('id', history_id)\
                .single()\
                .execute()
            
            return result.data
            
        except Exception as e:
            logger.error(f"❌ Error getting history: {str(e)}")
            raise
