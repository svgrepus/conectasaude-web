// Script para configurar buckets de storage no Supabase
// Executa: node scripts/setup-storage.js

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Erro: SUPABASE_URL e SUPABASE_SERVICE_KEY são obrigatórias');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupStorage() {
    console.log('🗂️  Configurando buckets de storage...');

    try {
        // Configurações dos buckets
        const buckets = [
            {
                id: 'municipes-fotos',
                name: 'Fotos dos Munícipes',
                public: false,
                fileSizeLimit: 5 * 1024 * 1024, // 5MB
                allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp']
            },
            {
                id: 'documentos',
                name: 'Documentos Diversos',
                public: false,
                fileSizeLimit: 10 * 1024 * 1024, // 10MB
                allowedMimeTypes: ['application/pdf', 'image/jpeg', 'image/png']
            },
            {
                id: 'relatorios',
                name: 'Relatórios Exportados',
                public: false,
                fileSizeLimit: 50 * 1024 * 1024, // 50MB
                allowedMimeTypes: ['text/csv', 'application/json', 'application/pdf']
            }
        ];

        for (const bucketConfig of buckets) {
            console.log(`📁 Criando bucket: ${bucketConfig.id}`);

            // Tentar criar o bucket
            const { data, error } = await supabase.storage.createBucket(bucketConfig.id, {
                public: bucketConfig.public,
                fileSizeLimit: bucketConfig.fileSizeLimit,
                allowedMimeTypes: bucketConfig.allowedMimeTypes
            });

            if (error) {
                if (error.message.includes('already exists')) {
                    console.log(`✅ Bucket ${bucketConfig.id} já existe`);
                } else {
                    console.error(`❌ Erro ao criar bucket ${bucketConfig.id}:`, error.message);
                }
            } else {
                console.log(`✅ Bucket ${bucketConfig.id} criado com sucesso`);
            }

            // Configurar políticas RLS para o bucket
            await setupBucketPolicies(bucketConfig.id);
        }

        console.log('✅ Configuração de storage concluída!');

    } catch (error) {
        console.error('❌ Erro na configuração de storage:', error.message);
        process.exit(1);
    }
}

async function setupBucketPolicies(bucketId) {
    console.log(`🔒 Configurando políticas RLS para bucket: ${bucketId}`);

    const policies = [
        // Política para usuários autenticados poderem fazer upload
        {
            name: `${bucketId}_upload_policy`,
            definition: `(auth.role() = 'authenticated')`,
            allowed_operations: ['INSERT'],
            bucket_id: bucketId
        },
        // Política para usuários visualizarem apenas seus próprios arquivos
        {
            name: `${bucketId}_select_policy`,
            definition: `(auth.uid()::text = (storage.foldername(name))[1])`,
            allowed_operations: ['SELECT'],
            bucket_id: bucketId
        },
        // Política para admins acessarem tudo
        {
            name: `${bucketId}_admin_policy`,
            definition: `(get_user_role(auth.uid()) = 'admin')`,
            allowed_operations: ['SELECT', 'INSERT', 'UPDATE', 'DELETE'],
            bucket_id: bucketId
        }
    ];

    // Nota: As políticas RLS para storage são configuradas via SQL
    // Este script serve principalmente para criar os buckets
    console.log(`ℹ️  Políticas RLS para ${bucketId} devem ser configuradas via SQL`);
}

// Executar se chamado diretamente
if (require.main === module) {
    setupStorage().catch(console.error);
}

module.exports = { setupStorage };
