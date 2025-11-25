import { Injectable } from '@nestjs/common';

export type SupportedLanguage = 'fr' | 'en' | 'es';

export interface TranslationKey {
  [key: string]: string | TranslationKey;
}

/**
 * Internationalization service for multi-language support
 */
@Injectable()
export class I18nService {
  private currentLanguage: SupportedLanguage = 'fr';
  private translations: Record<SupportedLanguage, any> = {
    fr: {},
    en: {},
    es: {},
  };

  constructor() {
    this.loadTranslations();
  }

  /**
   * Load all translations
   */
  private loadTranslations(): void {
    this.translations = {
      fr: this.getFrenchTranslations(),
      en: this.getEnglishTranslations(),
      es: this.getSpanishTranslations(),
    };
  }

  /**
   * Set current language
   */
  setLanguage(lang: SupportedLanguage): void {
    this.currentLanguage = lang;
  }

  /**
   * Get current language
   */
  getLanguage(): SupportedLanguage {
    return this.currentLanguage;
  }

  /**
   * Translate a key
   */
  t(key: string, params?: Record<string, any>): string {
    let translation = this.getNestedTranslation(
      this.translations[this.currentLanguage],
      key,
    );

    // Fallback to English if translation not found
    if (!translation) {
      translation = this.getNestedTranslation(this.translations['en'], key);
    }

    // Fallback to key itself if still not found
    if (!translation) {
      return key;
    }

    // Replace parameters
    if (params) {
      Object.entries(params).forEach(([param, value]) => {
        translation = translation.replace(
          new RegExp(`{{${param}}}`, 'g'),
          String(value),
        );
      });
    }

    return translation;
  }

  /**
   * Get nested translation value
   */
  private getNestedTranslation(obj: any, key: string): string | null {
    const keys = key.split('.');
    let current = obj;

    for (const k of keys) {
      if (current[k] === undefined) {
        return null;
      }
      current = current[k];
    }

    return typeof current === 'string' ? current : null;
  }

  /**
   * French translations
   */
  private getFrenchTranslations(): any {
    return {
      common: {
        welcome: 'Bienvenue',
        hello: 'Bonjour {{name}}',
        goodbye: 'Au revoir',
        yes: 'Oui',
        no: 'Non',
        save: 'Enregistrer',
        cancel: 'Annuler',
        delete: 'Supprimer',
        edit: 'Modifier',
        confirm: 'Confirmer',
        success: 'Succès',
        error: 'Erreur',
        loading: 'Chargement...',
      },
      auth: {
        login: 'Connexion',
        logout: 'Déconnexion',
        register: 'Inscription',
        email: 'Email',
        password: 'Mot de passe',
        forgotPassword: 'Mot de passe oublié?',
        resetPassword: 'Réinitialiser le mot de passe',
        loginSuccess: 'Connexion réussie',
        loginError: 'Email ou mot de passe incorrect',
        registerSuccess: 'Inscription réussie',
        twoFactorCode: 'Code de vérification',
      },
      investment: {
        title: 'Investissements',
        invest: 'Investir',
        amount: 'Montant',
        project: 'Projet',
        returns: 'Rendements',
        totalInvested: 'Total investi',
        totalReturns: 'Rendements totaux',
        activeInvestments: 'Investissements actifs',
        investmentSuccess: 'Investissement de €{{amount}} effectué avec succès',
        investmentError: 'Échec de l\'investissement',
        minimumInvestment: 'Investissement minimum: €{{amount}}',
        maximumInvestment: 'Investissement maximum: €{{amount}}',
      },
      project: {
        title: 'Projets',
        createProject: 'Créer un projet',
        projectDetails: 'Détails du projet',
        targetAmount: 'Objectif de financement',
        currentAmount: 'Montant actuel',
        returnRate: 'Taux de rendement',
        duration: 'Durée',
        status: 'Statut',
        category: 'Catégorie',
        investors: 'Investisseurs',
        description: 'Description',
        riskLevel: 'Niveau de risque',
        projectCreated: 'Projet créé avec succès',
        projectUpdated: 'Projet mis à jour',
      },
      kyc: {
        title: 'Vérification d\'identité (KYC)',
        uploadDocument: 'Télécharger un document',
        documentType: 'Type de document',
        passport: 'Passeport',
        idCard: 'Carte d\'identité',
        drivingLicense: 'Permis de conduire',
        proofOfAddress: 'Justificatif de domicile',
        kycPending: 'Vérification en cours',
        kycApproved: 'Vérification approuvée',
        kycRejected: 'Vérification refusée',
        kycSubmitted: 'Documents soumis avec succès',
      },
      notification: {
        investmentConfirmed: 'Investissement confirmé',
        returnReceived: 'Rendement reçu',
        kycApproved: 'KYC approuvé',
        kycRejected: 'KYC refusé',
        withdrawalProcessed: 'Retrait traité',
        projectUpdate: 'Mise à jour du projet',
        newMessage: 'Nouveau message',
      },
      error: {
        notFound: 'Non trouvé',
        unauthorized: 'Non autorisé',
        forbidden: 'Accès interdit',
        badRequest: 'Requête invalide',
        serverError: 'Erreur serveur',
        networkError: 'Erreur réseau',
        rateLimitExceeded: 'Limite de requêtes dépassée',
        invalidCredentials: 'Identifiants invalides',
        insufficientBalance: 'Solde insuffisant',
      },
      email: {
        subject: {
          welcome: 'Bienvenue sur OJ Investment',
          investmentConfirmation: 'Investissement confirmé',
          returnPayment: 'Rendement reçu',
          kycApproval: 'KYC approuvé',
          passwordReset: 'Réinitialisation du mot de passe',
        },
      },
    };
  }

  /**
   * English translations
   */
  private getEnglishTranslations(): any {
    return {
      common: {
        welcome: 'Welcome',
        hello: 'Hello {{name}}',
        goodbye: 'Goodbye',
        yes: 'Yes',
        no: 'No',
        save: 'Save',
        cancel: 'Cancel',
        delete: 'Delete',
        edit: 'Edit',
        confirm: 'Confirm',
        success: 'Success',
        error: 'Error',
        loading: 'Loading...',
      },
      auth: {
        login: 'Login',
        logout: 'Logout',
        register: 'Register',
        email: 'Email',
        password: 'Password',
        forgotPassword: 'Forgot password?',
        resetPassword: 'Reset password',
        loginSuccess: 'Login successful',
        loginError: 'Invalid email or password',
        registerSuccess: 'Registration successful',
        twoFactorCode: 'Verification code',
      },
      investment: {
        title: 'Investments',
        invest: 'Invest',
        amount: 'Amount',
        project: 'Project',
        returns: 'Returns',
        totalInvested: 'Total invested',
        totalReturns: 'Total returns',
        activeInvestments: 'Active investments',
        investmentSuccess: 'Investment of €{{amount}} successful',
        investmentError: 'Investment failed',
        minimumInvestment: 'Minimum investment: €{{amount}}',
        maximumInvestment: 'Maximum investment: €{{amount}}',
      },
      project: {
        title: 'Projects',
        createProject: 'Create project',
        projectDetails: 'Project details',
        targetAmount: 'Funding goal',
        currentAmount: 'Current amount',
        returnRate: 'Return rate',
        duration: 'Duration',
        status: 'Status',
        category: 'Category',
        investors: 'Investors',
        description: 'Description',
        riskLevel: 'Risk level',
        projectCreated: 'Project created successfully',
        projectUpdated: 'Project updated',
      },
      kyc: {
        title: 'Identity Verification (KYC)',
        uploadDocument: 'Upload document',
        documentType: 'Document type',
        passport: 'Passport',
        idCard: 'ID Card',
        drivingLicense: 'Driving License',
        proofOfAddress: 'Proof of address',
        kycPending: 'Verification pending',
        kycApproved: 'Verification approved',
        kycRejected: 'Verification rejected',
        kycSubmitted: 'Documents submitted successfully',
      },
      notification: {
        investmentConfirmed: 'Investment confirmed',
        returnReceived: 'Return received',
        kycApproved: 'KYC approved',
        kycRejected: 'KYC rejected',
        withdrawalProcessed: 'Withdrawal processed',
        projectUpdate: 'Project update',
        newMessage: 'New message',
      },
      error: {
        notFound: 'Not found',
        unauthorized: 'Unauthorized',
        forbidden: 'Forbidden',
        badRequest: 'Bad request',
        serverError: 'Server error',
        networkError: 'Network error',
        rateLimitExceeded: 'Rate limit exceeded',
        invalidCredentials: 'Invalid credentials',
        insufficientBalance: 'Insufficient balance',
      },
      email: {
        subject: {
          welcome: 'Welcome to OJ Investment',
          investmentConfirmation: 'Investment confirmed',
          returnPayment: 'Return received',
          kycApproval: 'KYC approved',
          passwordReset: 'Password reset',
        },
      },
    };
  }

  /**
   * Spanish translations
   */
  private getSpanishTranslations(): any {
    return {
      common: {
        welcome: 'Bienvenido',
        hello: 'Hola {{name}}',
        goodbye: 'Adiós',
        yes: 'Sí',
        no: 'No',
        save: 'Guardar',
        cancel: 'Cancelar',
        delete: 'Eliminar',
        edit: 'Editar',
        confirm: 'Confirmar',
        success: 'Éxito',
        error: 'Error',
        loading: 'Cargando...',
      },
      auth: {
        login: 'Iniciar sesión',
        logout: 'Cerrar sesión',
        register: 'Registrarse',
        email: 'Correo electrónico',
        password: 'Contraseña',
        forgotPassword: '¿Olvidaste tu contraseña?',
        resetPassword: 'Restablecer contraseña',
        loginSuccess: 'Inicio de sesión exitoso',
        loginError: 'Correo o contraseña incorrectos',
        registerSuccess: 'Registro exitoso',
        twoFactorCode: 'Código de verificación',
      },
      investment: {
        title: 'Inversiones',
        invest: 'Invertir',
        amount: 'Cantidad',
        project: 'Proyecto',
        returns: 'Rendimientos',
        totalInvested: 'Total invertido',
        totalReturns: 'Rendimientos totales',
        activeInvestments: 'Inversiones activas',
        investmentSuccess: 'Inversión de €{{amount}} exitosa',
        investmentError: 'Inversión fallida',
        minimumInvestment: 'Inversión mínima: €{{amount}}',
        maximumInvestment: 'Inversión máxima: €{{amount}}',
      },
      project: {
        title: 'Proyectos',
        createProject: 'Crear proyecto',
        projectDetails: 'Detalles del proyecto',
        targetAmount: 'Objetivo de financiación',
        currentAmount: 'Cantidad actual',
        returnRate: 'Tasa de retorno',
        duration: 'Duración',
        status: 'Estado',
        category: 'Categoría',
        investors: 'Inversores',
        description: 'Descripción',
        riskLevel: 'Nivel de riesgo',
        projectCreated: 'Proyecto creado con éxito',
        projectUpdated: 'Proyecto actualizado',
      },
      kyc: {
        title: 'Verificación de identidad (KYC)',
        uploadDocument: 'Subir documento',
        documentType: 'Tipo de documento',
        passport: 'Pasaporte',
        idCard: 'Documento de identidad',
        drivingLicense: 'Licencia de conducir',
        proofOfAddress: 'Comprobante de domicilio',
        kycPending: 'Verificación pendiente',
        kycApproved: 'Verificación aprobada',
        kycRejected: 'Verificación rechazada',
        kycSubmitted: 'Documentos enviados con éxito',
      },
      notification: {
        investmentConfirmed: 'Inversión confirmada',
        returnReceived: 'Rendimiento recibido',
        kycApproved: 'KYC aprobado',
        kycRejected: 'KYC rechazado',
        withdrawalProcessed: 'Retiro procesado',
        projectUpdate: 'Actualización del proyecto',
        newMessage: 'Nuevo mensaje',
      },
      error: {
        notFound: 'No encontrado',
        unauthorized: 'No autorizado',
        forbidden: 'Prohibido',
        badRequest: 'Solicitud incorrecta',
        serverError: 'Error del servidor',
        networkError: 'Error de red',
        rateLimitExceeded: 'Límite de solicitudes excedido',
        invalidCredentials: 'Credenciales inválidas',
        insufficientBalance: 'Saldo insuficiente',
      },
      email: {
        subject: {
          welcome: 'Bienvenido a OJ Investment',
          investmentConfirmation: 'Inversión confirmada',
          returnPayment: 'Rendimiento recibido',
          kycApproval: 'KYC aprobado',
          passwordReset: 'Restablecer contraseña',
        },
      },
    };
  }

  /**
   * Format currency based on language
   */
  formatCurrency(amount: number, currency: string = 'EUR'): string {
    const locale = {
      fr: 'fr-FR',
      en: 'en-US',
      es: 'es-ES',
    }[this.currentLanguage];

    return new Intl.NumberFormat(locale, {
      style: 'currency',
      currency,
    }).format(amount);
  }

  /**
   * Format date based on language
   */
  formatDate(date: Date, format: 'short' | 'long' = 'short'): string {
    const locale = {
      fr: 'fr-FR',
      en: 'en-US',
      es: 'es-ES',
    }[this.currentLanguage];

    const options: Intl.DateTimeFormatOptions =
      format === 'short'
        ? { year: 'numeric', month: '2-digit', day: '2-digit' }
        : { year: 'numeric', month: 'long', day: 'numeric' };

    return new Intl.DateTimeFormat(locale, options).format(date);
  }

  /**
   * Format number based on language
   */
  formatNumber(num: number): string {
    const locale = {
      fr: 'fr-FR',
      en: 'en-US',
      es: 'es-ES',
    }[this.currentLanguage];

    return new Intl.NumberFormat(locale).format(num);
  }
}
