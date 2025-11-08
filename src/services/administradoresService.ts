import { authService } from "./auth-simple";
import { SUPABASE_CONFIG, getSupabaseHeaders } from "../config/supabase";
import { magicLinkService } from "./magicLinkService";

// Interface para Admin User baseada na resposta da Edge Function
export interface AdminUser {
  id: string;
  email: string;
  email_confirmed_at?: string;
  phone?: string;
  confirmed_at?: string;
  last_sign_in_at?: string;
  created_at: string;
  updated_at: string;
  app_metadata?: {
    provider?: string;
    providers?: string[];
    role?: string;
  };
  user_metadata?: {
    email?: string;
    email_verified?: boolean;
    phone_verified?: boolean;
    role?: string;
    sub?: string;
    name?: string;
    full_name?: string;
    display_name?: string;
    nome?: string;
    phone?: string;
    telefone?: string;
    data_nascimento?: string;
    cargo?: string;
  };
  role?: "admin" | "funcionario" | "municipe";
  is_active?: boolean;
}

// Interface para criação/edição de administrador
export interface AdminUserForm {
  email: string;
  password?: string; // Opcional para edição
  display_name: string;
  full_name?: string; // Nome completo
  data_nascimento?: string;
  telefone?: string;
  phone?: string; // Manter para compatibilidade
  role: "admin" | "funcionario" | "municipe";
}

class AdministradoresService {
  private baseUrl = 'https://neqkqjpynrinlsodfrkf.supabase.co/functions/v1';

  // Obter lista de usuários administradores via Edge Function
  async getAdministradores(): Promise<AdminUser[]> {
    try {
      console.log("🔍 AdministradoresService: Buscando lista de administradores...");
      
      const accessToken = authService.getAccessToken();
      if (!accessToken) {
        throw new Error("Token de acesso não encontrado. Usuário não autenticado.");
      }

      const response = await fetch(`${this.baseUrl}/admin-users`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("❌ Erro na API de administradores:", errorData);
        throw new Error(`Erro ao buscar administradores: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ AdministradoresService: Administradores carregados:", data.length);
      
      return data;
    } catch (error) {
      console.error("❌ AdministradoresService: Erro ao buscar administradores:", error);
      throw error;
    }
  }

  // Criar novo administrador via Edge Function
  async criarAdministrador(adminData: AdminUserForm): Promise<AdminUser> {
    try {
      console.log("➕ AdministradoresService: Criando administrador...", adminData.email);
      
      const accessToken = authService.getAccessToken();
      if (!accessToken) {
        throw new Error("Token de acesso não encontrado. Usuário não autenticado.");
      }

      // Processar nome completo e extrair primeiro nome
      const fullName = adminData.full_name || adminData.display_name || "";
      const firstName = fullName.trim().split(' ')[0] || "";

      console.log("🔍 DEBUG - Dados recebidos:");
      console.log("  adminData.full_name:", adminData.full_name);
      console.log("  adminData.display_name:", adminData.display_name);
      console.log("  fullName processado:", fullName);
      console.log("  firstName processado:", firstName);

      const payload = {
        email: adminData.email,
        password: adminData.password,
        user_metadata: {
          full_name: fullName,
          display_name: firstName,
          data_nascimento: adminData.data_nascimento,
          telefone: adminData.phone,
          role: adminData.role,
        },
        app_metadata: {
          role: adminData.role,
        },
        phone: adminData.phone || "",
      };

      console.log("📤 DEBUG - Payload enviado:", JSON.stringify(payload, null, 2));

      const response = await fetch(`${this.baseUrl}/admin-create-user`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("❌ Erro ao criar administrador:", errorData);
        throw new Error(`Erro ao criar administrador: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ AdministradoresService: Administrador criado:", data);
      
      return data;
    } catch (error) {
      console.error("❌ AdministradoresService: Erro ao criar administrador:", error);
      throw error;
    }
  }

  // Atualizar administrador via Edge Function
  async atualizarAdministrador(userId: string, adminData: Partial<AdminUserForm>): Promise<AdminUser> {
    try {
      console.log("✏️ AdministradoresService: Atualizando administrador...", userId);
      
      const accessToken = authService.getAccessToken();
      if (!accessToken) {
        throw new Error("Token de acesso não encontrado. Usuário não autenticado.");
      }

      // Montar dados no formato esperado pela Edge Function
      const updateData: any = {
        user_id: userId,
      };
      
      if (adminData.email) {
        updateData.email = adminData.email;
      }
      
      if (adminData.password) {
        updateData.password = adminData.password;
      }
      
      // Processar nome completo e extrair primeiro nome
      if (adminData.display_name || adminData.full_name) {
        const fullName = adminData.full_name || adminData.display_name || "";
        const firstName = fullName.trim().split(' ')[0] || "";
        
        console.log("🔍 DEBUG ATUALIZAÇÃO - Dados recebidos:");
        console.log("  adminData.full_name:", adminData.full_name);
        console.log("  adminData.display_name:", adminData.display_name);
        console.log("  fullName processado:", fullName);
        console.log("  firstName processado:", firstName);
        
        // Enviar full_name e display_name no nível raiz
        updateData.full_name = fullName;
        updateData.display_name = firstName;

        // Manter user_metadata para outros campos se necessário
        if (adminData.data_nascimento || adminData.phone !== undefined || adminData.role) {
          updateData.user_metadata = {};
          
          if (adminData.data_nascimento) {
            updateData.user_metadata.data_nascimento = adminData.data_nascimento;
          }
          if (adminData.phone !== undefined) {
            updateData.user_metadata.telefone = adminData.phone;
          }
          if (adminData.role) {
            updateData.user_metadata.role = adminData.role;
          }
        }
      }
      
      if (adminData.phone !== undefined) {
        updateData.phone = adminData.phone;
      }

      // Sempre definir app_metadata.role para admins
      updateData.app_metadata = {
        role: adminData.role || "admin",
      };

      console.log("📤 DEBUG ATUALIZAÇÃO - Payload final enviado:", JSON.stringify(updateData, null, 2));

      const response = await fetch(`${this.baseUrl}/admin-users`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${accessToken}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("❌ Erro ao atualizar administrador:", errorData);
        throw new Error(`Erro ao atualizar administrador: ${response.status}`);
      }

      const data = await response.json();
      console.log("✅ AdministradoresService: Administrador atualizado:", data);
      
      return data;
    } catch (error) {
      console.error("❌ AdministradoresService: Erro ao atualizar administrador:", error);
      throw error;
    }
  }

  // Deletar administrador via Edge Function
  async deletarAdministrador(userId: string): Promise<void> {
    try {
      console.log("🗑️ AdministradoresService: Deletando administrador...", userId);
      
      const accessToken = authService.getAccessToken();
      if (!accessToken) {
        throw new Error("Token de acesso não encontrado. Usuário não autenticado.");
      }

      console.log("🗑️ DEBUG EXCLUSÃO - URL:", `${this.baseUrl}/admin-users?user_id=${userId}`);

      const response = await fetch(`${this.baseUrl}/admin-users?user_id=${userId}`, {
        method: "DELETE",
        headers: getSupabaseHeaders(accessToken),
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error("❌ Erro ao deletar administrador:", errorData);
        throw new Error(`Erro ao deletar administrador: ${response.status}`);
      }

      console.log("✅ AdministradoresService: Administrador deletado com sucesso");
    } catch (error) {
      console.error("❌ AdministradoresService: Erro ao deletar administrador:", error);
      throw error;
    }
  }

  // Verificar se usuário atual é admin
  async isCurrentUserAdmin(): Promise<boolean> {
    try {
      const user = await authService.getCurrentUser();
      return user?.role === "admin";
    } catch (error) {
      console.error("❌ Erro ao verificar role do usuário:", error);
      return false;
    }
  }

  // Enviar Magic Link para administrador
  async enviarMagicLink(email: string, fullName: string, isFirstAccess: boolean = true): Promise<{ success: boolean; message: string; error?: any }> {
    try {
      console.log("🔗 AdministradoresService: Enviando Magic Link para:", email);
      
      let result;
      if (isFirstAccess) {
        result = await magicLinkService.sendMagicLinkForNewAdmin(email, fullName);
      } else {
        result = await magicLinkService.sendMagicLinkForEmployee(email, fullName);
      }

      return result;
    } catch (error) {
      console.error("❌ AdministradoresService: Erro ao enviar Magic Link:", error);
      return {
        success: false,
        message: "Erro ao enviar e-mail de acesso",
        error: error
      };
    }
  }
}

export const administradoresService = new AdministradoresService();