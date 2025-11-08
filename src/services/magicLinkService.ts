import { supabase } from "./supabase";
import { authService } from "./auth-simple";

// Interface para dados do Magic Link
interface MagicLinkData {
  email: string;
  redirectTo?: string;
  data?: {
    full_name?: string;
    display_name?: string;
    data_nascimento?: string;
    telefone?: string;
    role?: string;
    is_first_access?: boolean;
  };
}

class MagicLinkService {
  
  /**
   * Envia Magic Link para o usuário
   * @param email Email do usuário
   * @param isFirstAccess Se é o primeiro acesso (para definir senha)
   * @param userData Dados adicionais do usuário
   */
  async sendMagicLink(data: MagicLinkData): Promise<{ success: boolean; message: string; error?: any }> {
    try {
      console.log("🔗 MagicLinkService: Enviando Magic Link para:", data.email);

      // URL de redirecionamento após o login
      const redirectTo = data.redirectTo || `${window.location.origin}/auth/callback`;

      const { error } = await supabase.auth.signInWithOtp({
        email: data.email,
        options: {
          emailRedirectTo: redirectTo,
          data: data.data || {},
        }
      });

      if (error) {
        console.error("❌ Erro ao enviar Magic Link:", error);
        return {
          success: false,
          message: "Erro ao enviar e-mail de acesso",
          error: error
        };
      }

      console.log("✅ Magic Link enviado com sucesso");
      return {
        success: true,
        message: "E-mail de acesso enviado com sucesso! Verifique sua caixa de entrada."
      };

    } catch (error) {
      console.error("❌ Erro inesperado ao enviar Magic Link:", error);
      return {
        success: false,
        message: "Erro inesperado ao enviar e-mail",
        error: error
      };
    }
  }

  /**
   * Envia Magic Link para novo administrador
   */
  async sendMagicLinkForNewAdmin(
    email: string, 
    nome: string,
    dataNascimento?: string,
    telefone?: string
  ): Promise<{ success: boolean; message: string; error?: any }> {
    // Processar nome completo e extrair primeiro nome
    const fullName = nome.trim();
    const firstName = fullName.split(' ')[0] || "";

    return this.sendMagicLink({
      email,
      redirectTo: `${window.location.origin}/auth/callback?first_access=true`,
      data: {
        full_name: fullName,
        display_name: firstName,
        data_nascimento: dataNascimento,
        telefone,
        role: "admin",
        is_first_access: true
      }
    });
  }

  /**
   * Envia Magic Link para funcionário existente
   */
  async sendMagicLinkForEmployee(
    email: string, 
    nome?: string,
    dataNascimento?: string,
    telefone?: string
  ): Promise<{ success: boolean; message: string; error?: any }> {
    // Processar nome completo e extrair primeiro nome
    const fullName = nome?.trim() || "";
    const firstName = fullName.split(' ')[0] || "";

    return this.sendMagicLink({
      email,
      data: {
        full_name: fullName,
        display_name: firstName,
        data_nascimento: dataNascimento,
        telefone,
        role: "funcionario"
      }
    });
  }

  /**
   * Processa callback do Magic Link
   */
  async handleMagicLinkCallback(): Promise<{ success: boolean; user?: any; isFirstAccess?: boolean; error?: any }> {
    try {
      console.log("🔗 MagicLinkService: Processando callback do Magic Link");

      // Verificar se há parâmetros de callback na URL (tanto query params quanto hash)
      let urlParams = new URLSearchParams(window.location.search);
      let accessToken = urlParams.get('access_token');
      let refreshToken = urlParams.get('refresh_token');
      let isFirstAccess = urlParams.get('first_access') === 'true';

      // Se não encontrou nos query params, verificar no hash (URL fragment)
      if (!accessToken && window.location.hash) {
        const hashParams = new URLSearchParams(window.location.hash.substring(1));
        accessToken = hashParams.get('access_token');
        refreshToken = hashParams.get('refresh_token');
        isFirstAccess = hashParams.get('first_access') === 'true';
      }

      if (accessToken && refreshToken) {
        // Definir sessão no Supabase
        const { data, error } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: refreshToken
        });

        if (error) {
          console.error("❌ Erro ao definir sessão:", error);
          return {
            success: false,
            error: error
          };
        }

        console.log("✅ Sessão definida com sucesso");
        
        // Verificar se é primeiro acesso baseado nos metadados do usuário
        const isFirstAccessFromMeta = data.user?.user_metadata?.is_first_access === true;
        
        return {
          success: true,
          user: data.user,
          isFirstAccess: isFirstAccess || isFirstAccessFromMeta
        };
      }

      // Tentar obter sessão atual
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        console.error("❌ Erro ao obter sessão:", error);
        return {
          success: false,
          error: error
        };
      }

      if (data.session) {
        console.log("✅ Sessão existente encontrada");
        return {
          success: true,
          user: data.session.user,
          isFirstAccess: false
        };
      }

      console.log("⚠️ Nenhuma sessão encontrada");
      return {
        success: false,
        error: { message: "Nenhuma sessão encontrada" }
      };

    } catch (error) {
      console.error("❌ Erro inesperado ao processar callback:", error);
      return {
        success: false,
        error: error
      };
    }
  }

  /**
   * Verifica se usuário precisa definir senha (primeiro acesso)
   */
  async checkIfFirstAccess(userId: string): Promise<boolean> {
    try {
      // Verificar se o usuário já tem uma senha definida
      // Isso pode ser feito verificando o metadata do usuário
      const { data: user, error } = await supabase.auth.getUser();
      
      if (error || !user) {
        return false;
      }

      // Verificar se é primeiro acesso através do metadata
      const isFirstAccess = user.user?.user_metadata?.is_first_access || false;
      
      return isFirstAccess;
    } catch (error) {
      console.error("❌ Erro ao verificar primeiro acesso:", error);
      return false;
    }
  }

  /**
   * Atualiza senha do usuário no primeiro acesso
   */
  async updatePasswordFirstAccess(password: string): Promise<{ success: boolean; message: string; error?: any }> {
    try {
      console.log("🔐 MagicLinkService: Atualizando senha do primeiro acesso");

      const { error } = await supabase.auth.updateUser({
        password: password,
        data: {
          is_first_access: false // Marcar que não é mais primeiro acesso
        }
      });

      if (error) {
        console.error("❌ Erro ao atualizar senha:", error);
        return {
          success: false,
          message: "Erro ao definir senha",
          error: error
        };
      }

      console.log("✅ Senha atualizada com sucesso");
      return {
        success: true,
        message: "Senha definida com sucesso!"
      };

    } catch (error) {
      console.error("❌ Erro inesperado ao atualizar senha:", error);
      return {
        success: false,
        message: "Erro inesperado ao definir senha",
        error: error
      };
    }
  }
}

export const magicLinkService = new MagicLinkService();
export default magicLinkService;