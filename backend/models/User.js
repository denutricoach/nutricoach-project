const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  
  // Sectie 1: Algemeen
  algemeen_naam: { type: String, required: true },
  algemeen_leeftijd: { type: String },
  algemeen_lengte: { type: String },
  algemeen_gewicht: { type: String },
  algemeen_beroep: { type: String },
  algemeen_leefsituatie: { type: String },

  // Sectie 2: Hulpvraag
  hulpvraag_reden: { type: String },
  hulpvraag_doel: { type: String, required: true },
  hulpvraag_eerdere_hulp: { type: String },
  hulpvraag_termijn_doelen: { type: String },

  // Sectie 3: Medisch
  medisch_aandoeningen: { type: String },
  medisch_medicatie: { type: String },
  medisch_allergieen_intoleranties: { type: String, required: true },
  medisch_psychische_klachten: { type: String },

  // Sectie 4: Voeding
  voeding_gemiddelde_dag: { type: String },
  voeding_aantal_maaltijden: { type: String },
  voeding_maaltijden_overslaan: { type: String },
  voeding_eetbuien_emotie_eten: { type: String },
  voeding_waterinname: { type: String },
  voeding_alcohol_cafeine: { type: String },

  // Sectie 5: Beweeg
  beweeg_hoe_vaak: { type: String },
  beweeg_welke_vormen: { type: String },
  beweeg_conditie_ervaring: { type: String },

  // Sectie 6: Slaap
  slaap_kwaliteit: { type: String },
  slaap_stress_ervaring: { type: String },
  slaap_stress_invloed_eetgedrag: { type: String },

  // Sectie 7: Motivatie
  motivatie_score: { type: String },
  motivatie_hulp: { type: String },
  motivatie_ondersteuning_omgeving: { type: String },
  motivatie_obstakels: { type: String },

  // Sectie 8: Voorkeur
  voorkeur_producten_niet: { type: String },
  voorkeur_kookt_zelf: { type: String },
  voorkeur_eetstijl: { type: String },
  voorkeur_tijd_maaltijdbereiding: { type: String },

  // Sectie 9: Metingen
  metingen_vetpercentage: { type: String },
  metingen_spiermassa: { type: String },
  metingen_middelomtrek: { type: String },

  // Sectie 10: Afspraak
  afspraak_verwachting_coach: { type: String },
  afspraak_contactmomenten: { type: String },
  afspraak_manier_coaching: { type: String },

  // Overige data
  chatHistory: [{
    role: String,
    content: String,
    timestamp: { type: Date, default: Date.now }
  }],
  registratieDatum: { type: Date, default: Date.now },
  
  // Nieuwe velden voor authenticatieverbeteringen
  emailGeverifieerd: { type: Boolean, default: false },
  emailVerificatieToken: { type: String },
  wachtwoordResetToken: { type: String },
  wachtwoordResetExpires: { type: Date }
});

module.exports = mongoose.model('User', userSchema);
