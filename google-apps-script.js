// Main function to handle form submissions
function doPost(e) {
  try {
    // Validate request
    if (!e || !e.postData || !e.postData.contents) {
      return createJSONResponse('error', 'Invalid request format');
    }
    
    const data = JSON.parse(e.postData.contents);
    return handleFormSubmission(data);
    
  } catch (error) {
    Logger.log('Error in doPost: ' + error.toString());
    return createJSONResponse('error', error.toString());
  }
}

// Helper function for JSON responses
function createJSONResponse(status, message) {
  return ContentService.createTextOutput(JSON.stringify({
    status: status,
    message: message
  })).setMimeType(ContentService.MimeType.JSON);
}

// Handle new form submissions
function handleFormSubmission(data) {
  try {
    const sheet = SpreadsheetApp.getActiveSheet();
    
    // Add new subscriber
    const rowData = [
      data.email || '',
      data.role || '',
      data.nom || '',
      data.ville || '',
      Array.isArray(data.preferences) ? data.preferences.join(', ') : '',
      new Date().toLocaleString('fr-FR'),
      'No' // Email sent status
    ];
    
    sheet.appendRow(rowData);
    
    // Try to send welcome email immediately
    try {
      sendConfirmationEmail(data.email, data.nom, data.role);
      // If email sends successfully, update the status
      const lastRow = sheet.getLastRow();
      sheet.getRange(lastRow, 7).setValue('Yes'); // Column G for email status
    } catch (emailError) {
      Logger.log('Failed to send welcome email: ' + emailError.toString());
    }
    
    return createJSONResponse('success', 'Inscription réussie');
    
  } catch (error) {
    Logger.log('Error in form submission: ' + error.toString());
    return createJSONResponse('error', error.toString());
  }
}

// Get personalized content based on role
function getPersonalizedContent(role) {
  const content = {
    customer: {
      welcome: "Nous sommes ravis de vous compter parmi nos futurs clients privilégiés !",
      benefits: [
        "🍽️ Accès à une large sélection de restaurants de qualité",
        "⚡ Livraison rapide et suivi en temps réel",
        "💰 Programme de fidélité exclusif",
        "🎁 Offres spéciales réservées aux membres"
      ],
      callToAction: "Préparez-vous à découvrir une nouvelle façon de commander vos repas préférés !"
    },
    restaurant: {
      welcome: "Bienvenue dans l'aventure Eat Fast en tant que futur partenaire restaurateur !",
      benefits: [
        "📈 Augmentez votre visibilité et votre chiffre d'affaires",
        "🚀 Système de gestion des commandes intuitif",
        "📊 Tableaux de bord et analyses détaillées",
        "🤝 Support dédié aux restaurateurs"
      ],
      callToAction: "Ensemble, développons votre activité et satisfaisons plus de clients !"
    },
    delivery: {
      welcome: "Bienvenue dans l'équipe des livreurs partenaires Eat Fast !",
      benefits: [
        "💪 Soyez votre propre patron",
        "📱 Application mobile dédiée aux livreurs",
        "💰 Revenus attractifs et flexibles",
        "🛡️ Programme d'assurance exclusif"
      ],
      callToAction: "Rejoignez notre équipe de livreurs et participez à notre succès !"
    }
  };
  return content[role] || null;
}

// Send confirmation email
function sendConfirmationEmail(email, nom, role) {
  if (!email || !email.includes('@')) {
    throw new Error('Adresse email invalide');
  }
  
  const subject = 'Bienvenue dans la communauté Eat Fast ! 🚀';
  const roleText = getRoleText(role);
  const personalizedContent = getPersonalizedContent(role);
  
  const htmlBody = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="text-align: center; background: linear-gradient(135deg, #228B22, #FFD700); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
        <h1 style="color: white; margin: 0;">🍽️ Eat Fast</h1>
        <p style="color: white; margin: 5px 0 0 0;">Application 100% Camerounaise</p>
      </div>
      
      <h2 style="color: #228B22;">Bienvenue chez Eat Fast !</h2>
      
      <p>Bonjour ${nom || 'Cher(e) futur(e) partenaire'},</p>
      
      ${personalizedContent ? `
        <p style="font-size: 1.1em; color: #228B22;"><strong>${personalizedContent.welcome}</strong></p>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
          <h3 style="color: #228B22; margin-top: 0;">✨ Vos avantages :</h3>
          <ul style="list-style-type: none; padding: 0;">
            ${personalizedContent.benefits.map(benefit => `<li style="margin: 10px 0;">${benefit}</li>`).join('')}
          </ul>
        </div>
        
        <p style="background: #228B22; color: white; padding: 15px; border-radius: 8px; text-align: center;">
          <strong>${personalizedContent.callToAction}</strong>
        </p>
      ` : ''}
      
      <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <p><strong>Votre profil :</strong> ${roleText}</p>
        <p><strong>Date d'inscription :</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
      </div>
      
      <h3 style="color: #228B22;">📅 Dates de lancement :</h3>
      <ul>
        <li><strong>🌟 Version Web :</strong> 12 Novembre 2025</li>
        <li><strong>📱 Version Mobile :</strong> 10 Décembre 2025</li>
      </ul>
      
      <div style="margin: 30px 0; padding: 20px; border: 1px solid #228B22; border-radius: 8px;">
        <h4 style="color: #228B22; margin-top: 0;">🎯 Nos engagements :</h4>
        <ul>
          <li>Qualité de service exceptionnelle</li>
          <li>Support client réactif 7j/7</li>
          <li>Innovation continue</li>
          <li>Sécurité et confidentialité des données</li>
        </ul>
      </div>
      
      <div style="text-align: center; margin: 30px 0;">
        <div style="background: #228B22; color: white; padding: 15px; border-radius: 8px;">
          <p style="margin: 0; font-weight: bold;">Restez connecté(e) pour être parmi les premiers à découvrir notre plateforme !</p>
        </div>
      </div>
      
      <div style="border-top: 2px solid #228B22; margin-top: 30px; padding-top: 20px;">
        <p style="font-size: 14px; color: #666; text-align: center;">
          L'équipe Eat Fast 🇨🇲<br>
          <em>Dirigée par Mme Fina Carine</em><br><br>
          <small>Pour toute question, n'hésitez pas à nous contacter à support@eatfast.cm</small>
        </p>
      </div>
    </div>
  `;
  
  GmailApp.sendEmail(email, subject, '', {
    htmlBody: htmlBody,
    name: 'Eat Fast Team'
  });
  
  Logger.log('Welcome email sent successfully to: ' + email);
}

// Get role text in French
function getRoleText(role) {
  const roleMap = {
    'customer': 'Client - Je veux commander des repas',
    'restaurant': 'Restaurateur - Je veux vendre sur EatFast',
    'delivery': 'Livreur - Je veux devenir partenaire de livraison'
  };
  return roleMap[role] || role || 'Non spécifié';
}

// Function to send welcome emails to existing subscribers
function sendWelcomeEmailsToExistingSubscribers() {
  const sheet = SpreadsheetApp.getActiveSheet();
  const data = sheet.getDataRange().getValues();
  
  // Add Email Sent column if it doesn't exist
  let lastColumn = sheet.getLastColumn();
  if (lastColumn === 6) { // If no Email Sent column
    sheet.getRange(1, 7).setValue('Email Sent');
    // Fill all rows with 'No'
    if (data.length > 1) {
      const range = sheet.getRange(2, 7, data.length - 1, 1);
      range.setValue('No');
    }
  }
  
  // Process each row (skip header)
  for (let i = 1; i < data.length; i++) {
    const row = data[i];
    const email = row[0];  // Column A: Email
    const role = row[1];   // Column B: Role
    const nom = row[2];    // Column C: Name
    const emailSent = row[6] || 'No'; // Column G: Email Sent Status
    
    // Only send if email hasn't been sent
    if (email && email.includes('@') && emailSent !== 'Yes') {
      try {
        sendConfirmationEmail(email, nom, role);
        // Mark as sent
        sheet.getRange(i + 1, 7).setValue('Yes');
        // Wait 1 second to avoid hitting quota
        Utilities.sleep(1000);
      } catch (error) {
        Logger.log('Failed to send to ' + email + ': ' + error.toString());
        sheet.getRange(i + 1, 7).setValue('Failed');
      }
    }
  }
}

// Function to create automatic trigger (run once)
function createTrigger() {
  // Delete existing triggers first
  const triggers = ScriptApp.getProjectTriggers();
  triggers.forEach(trigger => ScriptApp.deleteTrigger(trigger));
  
  // Create new trigger to run every hour
  ScriptApp.newTrigger('sendWelcomeEmailsToExistingSubscribers')
    .timeBased()
    .everyHours(1)
    .create();
}