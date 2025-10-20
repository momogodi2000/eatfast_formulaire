/**
 * Google Apps Script for Eat Fast Newsletter Form - FIXED VERSION
 * This script handles form submissions and sends confirmation emails
 * 
 * SAFE UPDATE INSTRUCTIONS:
 * 1. Go to your existing Google Sheet with 70 emails
 * 2. Go to Extensions > Apps Script
 * 3. BACKUP your current script first (copy to notepad)
 * 4. Replace only the doPost function and add the new email functions
 * 5. Keep your existing doGet function as is
 */

function doPost(e) {
  try {
    // ENHANCED: Better handling of different request types and testing scenarios
    console.log('doPost called with:', e);
    
    // Handle case when called directly (testing) - e will be undefined
    if (!e) {
      console.log('doPost called without parameters (direct execution)');
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'doPost function should be called via HTTP POST request, not directly'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    // Handle different POST data formats
    let data;
    
    if (e.postData && e.postData.contents) {
      // Standard JSON POST
      try {
        data = JSON.parse(e.postData.contents);
      } catch (parseError) {
        console.error('JSON parse error:', parseError);
        return ContentService.createTextOutput(JSON.stringify({
          status: 'error',
          message: 'Invalid JSON format in request body'
        })).setMimeType(ContentService.MimeType.JSON);
      }
    } else if (e.parameter && Object.keys(e.parameter).length > 0) {
      // Form-encoded POST data
      data = e.parameter;
    } else {
      console.error('Invalid request data structure:', {
        hasPostData: !!e.postData,
        hasContents: !!(e.postData && e.postData.contents),
        hasParameters: !!(e.parameter && Object.keys(e.parameter).length > 0),
        fullRequest: e
      });
      return ContentService.createTextOutput(JSON.stringify({
        status: 'error',
        message: 'Invalid request format - no valid data found'
      })).setMimeType(ContentService.MimeType.JSON);
    }
    
    console.log('Parsed data:', data);
    
    // Handle email sending request
    if (data.action === 'sendEmail') {
      return sendEmail(data.data);
    }
    
    // Handle form submission (preserving your existing structure)
    return handleFormSubmission(data);
    
  } catch (error) {
    console.error('Error in doPost:', error);
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// Keep your existing doGet function exactly as it is
function doGet(e) {
  return ContentService
    .createTextOutput("Eat Fast Newsletter API is working!")
    .setMimeType(ContentService.MimeType.TEXT);
}

function handleFormSubmission(data) {
  try {
    // Using your existing sheet structure - NO CHANGES TO DATA FORMAT
    const sheet = SpreadsheetApp.getActiveSheet();
    
    // This matches your existing format exactly
    const rowData = [
      data.email || '',
      data.role || '',
      data.nom || '',
      data.ville || '',
      Array.isArray(data.preferences) ? data.preferences.join(', ') : '',
      new Date()
    ];
    
    // Add the data to the sheet (preserves existing structure)
    sheet.appendRow(rowData);
    
    // NEW: Send confirmation email (only if successful submission)
    try {
      sendConfirmationEmail(data.email, data.nom, data.role);
      console.log(`✅ Email sent to: ${data.email}`);
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError);
      // Don't fail the form submission if email fails
    }
    
    // Return your existing success format
    return ContentService.createTextOutput(JSON.stringify({
      status: 'success',
      message: 'Data saved successfully'
    })).setMimeType(ContentService.MimeType.JSON);
    
  } catch (error) {
    console.error('Error handling form submission:', error);
    return ContentService.createTextOutput(JSON.stringify({
      status: 'error',
      message: error.toString()
    })).setMimeType(ContentService.MimeType.JSON);
  }
}

// NEW FUNCTION: Send welcome email to new subscribers
function sendConfirmationEmail(email, nom, role) {
  try {
    // Only send if email is valid
    if (!email || !email.includes('@')) {
      throw new Error('Invalid email address');
    }
    
    const subject = 'Bienvenue dans la communauté Eat Fast ! 🚀';
    const roleText = getRoleText(role);
    
    const htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; background: linear-gradient(135deg, #228B22, #FFD700); padding: 20px; border-radius: 10px; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0;">🍽️ Eat Fast</h1>
          <p style="color: white; margin: 5px 0 0 0;">Application 100% Camerounaise</p>
        </div>
        
        <h2 style="color: #228B22;">Bienvenue chez Eat Fast !</h2>
        
        <p>Bonjour ${nom || 'Cher(e) futur(e) client(e)'},</p>
        
        <p>Merci de votre inscription à notre newsletter. Vous êtes maintenant membre de la communauté Eat Fast !</p>
        
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Votre profil :</strong> ${roleText}</p>
          <p><strong>Date d'inscription :</strong> ${new Date().toLocaleDateString('fr-FR')}</p>
        </div>
        
        <h3 style="color: #228B22;">📅 Dates de lancement :</h3>
        <ul>
          <li><strong>🌟 Version Web :</strong> 12 Novembre 2024</li>
          <li><strong>📱 Version Mobile :</strong> 10 Décembre 2024</li>
        </ul>
        
        <p>Nous vous tiendrons informé(e) de nos actualités, offres spéciales et du lancement officiel de notre plateforme.</p>
        
        <div style="text-align: center; margin: 30px 0;">
          <div style="background: #228B22; color: white; padding: 15px; border-radius: 8px;">
            <p style="margin: 0; font-weight: bold;">Restez connecté(e) pour être parmi les premiers à découvrir notre plateforme !</p>
          </div>
        </div>
        
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;">
        
        <p style="font-size: 14px; color: #666;">
          L'équipe Eat Fast 🇨🇲<br>
          <em>Dirigée par Mme Fina Carine</em><br>
          <em>Application de livraison 100% camerounaise</em>
        </p>
      </div>
    `;
    
    // Send the email using GmailApp
    GmailApp.sendEmail(email, subject, '', {
      htmlBody: htmlBody,
      name: 'Eat Fast Team'
    });
    
    console.log(`✅ Confirmation email sent to: ${email}`);
    
  } catch (error) {
    console.error('❌ Error sending confirmation email:', error);
    throw error;
  }
}

// Helper function to convert role codes to readable text
function getRoleText(role) {
  const roleMap = {
    'customer': 'Client - Je veux commander des repas',
    'restaurant': 'Restaurateur - Je veux vendre sur EatFast',
    'delivery': 'Livreur - Je veux devenir partenaire de livraison'
  };
  return roleMap[role] || role || 'Non spécifié';
}

// TEST FUNCTION - Run this to test email sending
function testEmail() {
  try {
    sendConfirmationEmail('test@example.com', 'Test User', 'customer');
    console.log('Test email sent successfully!');
  } catch (error) {
    console.error('Test email failed:', error);
  }
}

// FUNCTION TO SEND EMAILS TO EXISTING 70 SUBSCRIBERS (OPTIONAL)
function sendWelcomeEmailsToExistingSubscribers() {
  try {
    const sheet = SpreadsheetApp.getActiveSheet();
    const data = sheet.getDataRange().getValues();
    
    // Skip header row (row 1)
    for (let i = 1; i < data.length; i++) {
      const row = data[i];
      const email = row[0]; // Assuming email is in column A
      const nom = row[2];   // Assuming name is in column C  
      const role = row[1];  // Assuming role is in column B
      
      if (email && email.includes('@')) {
        try {
          sendConfirmationEmail(email, nom, role);
          console.log(`✅ Sent to existing subscriber: ${email}`);
          
          // Add a small delay to avoid rate limits
          Utilities.sleep(1000);
        } catch (error) {
          console.error(`❌ Failed to send to ${email}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('Error sending emails to existing subscribers:', error);
  }
}
