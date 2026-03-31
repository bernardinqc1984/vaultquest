import { useState, useEffect, useRef } from 'react';
import { Star, Trophy, User, Home, Clock, ChevronRight, RotateCcw, CheckCircle, XCircle, LogOut, AlertCircle } from 'lucide-react';
import { onAuthStateChanged, signInWithPopup, signOut } from 'firebase/auth';
import { auth, googleProvider, githubProvider, FIREBASE_CONFIGURED } from './firebase';

// ─── CSS ──────────────────────────────────────────────────────────────────────

const CSS_VARS = `
  :root {
    --vault-green:#00D4A4; --vault-gold:#FFD700;
    --vault-purple:#7C3AED; --vault-dark:#0a0e1a; --vault-surface:#111827;
  }
  body {
    background:var(--vault-dark);
    background-image:radial-gradient(circle at 1px 1px,rgba(0,212,164,.07) 1px,transparent 0);
    background-size:32px 32px;
  }
  @keyframes float-xp {
    0%  {opacity:1;transform:translateY(0) translateX(-50%);}
    100%{opacity:0;transform:translateY(-70px) translateX(-50%);}
  }
  .float-xp-anim{animation:float-xp 1.3s ease-out forwards;}
  @keyframes slide-in {
    0%  {opacity:0;transform:translateY(-30px) scale(.8);}
    60% {transform:translateY(6px) scale(1.05);}
    100%{opacity:1;transform:translateY(0) scale(1);}
  }
  .slide-in-anim{animation:slide-in .5s ease-out forwards;}
  @keyframes badge-pop {
    0%  {transform:scale(0) rotate(-15deg);opacity:0;}
    60% {transform:scale(1.3) rotate(5deg);opacity:1;}
    100%{transform:scale(1) rotate(0);opacity:1;}
  }
  .badge-pop-anim{animation:badge-pop .7s cubic-bezier(.34,1.56,.64,1) forwards;display:inline-block;}
  @keyframes pulse-glow {
    0%,100%{box-shadow:0 0 5px rgba(0,212,164,.3);}
    50%    {box-shadow:0 0 22px rgba(0,212,164,.8);}
  }
  @keyframes auth-float{
    0%,100%{transform:translateY(0);}
    50%    {transform:translateY(-8px);}
  }
  .auth-float{animation:auth-float 3s ease-in-out infinite;}
  *{scrollbar-width:thin;scrollbar-color:#374151 transparent;}
  *::-webkit-scrollbar{width:6px;}
  *::-webkit-scrollbar-track{background:transparent;}
  *::-webkit-scrollbar-thumb{background:#374151;border-radius:3px;}
`;

// ─── TRANSLATIONS ─────────────────────────────────────────────────────────────

const TRANSLATIONS = {
  en: {
    subtitle:'HashiCorp Vault Professional Certification Prep',
    tipTitle:'VAULT TIP OF THE DAY',
    examBtn:'⏱ Exam Mode — 20 Questions · 45 min',
    startBtn:'Start →', continueBtn:'Continue →', reviewBtn:'✅ Review', lockedBtn:'🔒 Locked',
    qDone:'done', level:'Level',
    typeMCQ:'⬡ Multiple Choice', typeTERMINAL:'⌨ Terminal', typeTF:'⊙ True / False',
    trueBtn:'✅ True', falseBtn:'❌ False',
    termPlaceholder:'type your command...', submitBtn:'Submit ↵',
    correctMsg:'Correct!', streakBonus:'streak bonus!', correctAnswer:'Correct answer:',
    nextBtn:'Next Question →', completeBtn:'🏁 Complete Chapter',
    chapterComplete:'Chapter Complete!', badgeUnlocked:'Badge Unlocked',
    backDash:'🏠 Back to Dashboard',
    examMode:'⏱ Exam Mode', passed:'PASSED!', keepStudying:'Keep Studying',
    correctWord:'correct', passThreshold:'Pass threshold: 75%', timeTaken:'Time taken:',
    hideReview:'Hide Review', reviewAnswers:'📋 Review Answers',
    vaultWarrior:'Vault Warrior', currentStreak:'Current Streak', bestStreak:'Best Streak',
    badgesTitle:'Badges', shortcutsTitle:'⌨ Keyboard Shortcuts',
    resetBtn:'Reset Progress', resetConfirm:'Reset all progress? This cannot be undone.',
    resetModalTitle:'Reset Progress', resetModalWarn:'This action is irreversible.',
    resetAllBtn:'Reset everything', resetAllDesc:'XP, streaks, badges, all questions',
    resetChaptersBtn:'Reset by chapter', resetChaptersDesc:'Choose which chapters to reset',
    resetConfirmAll:'Reset all progress', resetCancel:'Cancel',
    resetChapterSelect:'Select chapters to reset', resetSelectedBtn:'Reset selected',
    xpTo:'XP → Lv.', vaultPro:'🏅 Vault Professional',
    footer:'🔐 VaultQuest · HashiCorp Vault Professional Certification Prep · Built with ❤️ for the Vault community',
    shortcuts:[['1–4','Select MCQ option'],['T / F','Answer True/False'],['Enter','Submit / Next question'],['Escape','Back to dashboard']],
    q:{correct:'✅ Correct',incorrect:'❌ Incorrect'},
    // Auth
    authTitle:'Sign in to VaultQuest',
    authSubtitle:'Save your progress and sync across devices',
    signInGoogle:'Continue with Google',
    signInGithub:'Continue with GitHub',
    guestMode:'Continue as guest',
    guestNote:'Progress saved locally only',
    signOut:'Sign out',
    signedInAs:'Signed in as',
    authError:'Authentication failed. Please try again.',
    configWarning:'Firebase is not configured. Sign-in is disabled.',
    configSetup:'Set up Firebase',
    tutorialBtn:'📖 Tutorial', tutorialTitle:'Tutorial', tutorialBack:'← Back to Chapters',
    tutorialStep:'Step', tutorialOf:'of', tutorialCopy:'Copy', tutorialCopied:'✓ Copied!',
    tutorialNext:'Next →', tutorialPrev:'← Prev', tutorialDone:'Start Quiz →',
    tutorialNoteLabel:'Note', tutorialWarnLabel:'Warning', tutorialTipLabel:'Tip',
  },
  fr: {
    subtitle:'Préparation à la certification HashiCorp Vault Professional',
    tipTitle:'ASTUCE VAULT DU JOUR',
    examBtn:'⏱ Mode Examen — 20 Questions · 45 min',
    startBtn:'Démarrer →', continueBtn:'Continuer →', reviewBtn:'✅ Revoir', lockedBtn:'🔒 Verrouillé',
    qDone:'fait', level:'Niveau',
    typeMCQ:'⬡ Choix Multiple', typeTERMINAL:'⌨ Terminal', typeTF:'⊙ Vrai / Faux',
    trueBtn:'✅ Vrai', falseBtn:'❌ Faux',
    termPlaceholder:'tapez votre commande...', submitBtn:'Valider ↵',
    correctMsg:'Correct !', streakBonus:'bonus de série !', correctAnswer:'Bonne réponse :',
    nextBtn:'Question suivante →', completeBtn:'🏁 Terminer le chapitre',
    chapterComplete:'Chapitre terminé !', badgeUnlocked:'Badge débloqué',
    backDash:'🏠 Retour au tableau de bord',
    examMode:'⏱ Mode Examen', passed:'RÉUSSI !', keepStudying:'Continuez à étudier',
    correctWord:'correct(s)', passThreshold:'Seuil de réussite : 75%', timeTaken:'Temps écoulé :',
    hideReview:'Masquer la révision', reviewAnswers:'📋 Réviser les réponses',
    vaultWarrior:'Guerrier du Vault', currentStreak:'Série actuelle', bestStreak:'Meilleure série',
    badgesTitle:'Badges', shortcutsTitle:'⌨ Raccourcis clavier',
    resetBtn:'Réinitialiser la progression', resetConfirm:'Réinitialiser toute la progression ? Cette action est irréversible.',
    resetModalTitle:'Réinitialiser la progression', resetModalWarn:'Cette action est irréversible.',
    resetAllBtn:'Tout réinitialiser', resetAllDesc:'XP, séries, badges, toutes les questions',
    resetChaptersBtn:'Réinitialiser par chapitre', resetChaptersDesc:'Choisissez les chapitres à réinitialiser',
    resetConfirmAll:'Confirmer la réinitialisation', resetCancel:'Annuler',
    resetChapterSelect:'Sélectionnez les chapitres', resetSelectedBtn:'Réinitialiser la sélection',
    xpTo:'XP → Niv.', vaultPro:'🏅 Vault Professionnel',
    footer:'🔐 VaultQuest · Préparation certification HashiCorp Vault Professional · Fait avec ❤️ pour la communauté Vault',
    shortcuts:[['1–4','Sélectionner une option'],['T / F','Répondre Vrai/Faux'],['Entrée','Valider / Suivant'],['Échap','Tableau de bord']],
    q:{correct:'✅ Correct',incorrect:'❌ Incorrect'},
    // Auth
    authTitle:'Connectez-vous à VaultQuest',
    authSubtitle:'Sauvegardez votre progression et synchronisez vos appareils',
    signInGoogle:'Continuer avec Google',
    signInGithub:'Continuer avec GitHub',
    guestMode:'Continuer en invité',
    guestNote:'Progression sauvegardée localement uniquement',
    signOut:'Se déconnecter',
    signedInAs:'Connecté en tant que',
    authError:'Échec de l\'authentification. Veuillez réessayer.',
    configWarning:'Firebase n\'est pas configuré. La connexion est désactivée.',
    configSetup:'Configurer Firebase',
    tutorialBtn:'📖 Tutoriel', tutorialTitle:'Tutoriel', tutorialBack:'← Retour aux chapitres',
    tutorialStep:'Étape', tutorialOf:'sur', tutorialCopy:'Copier', tutorialCopied:'✓ Copié !',
    tutorialNext:'Suivant →', tutorialPrev:'← Précédent', tutorialDone:'Commencer le quiz →',
    tutorialNoteLabel:'Note', tutorialWarnLabel:'Attention', tutorialTipLabel:'Conseil',
  },
};

const LANGUAGES = [
  { code:'en', flag:'🇺🇸', label:'English' },
  { code:'fr', flag:'🇫🇷', label:'Français' },
];

// ─── STATIC DATA ──────────────────────────────────────────────────────────────

const STORAGE_KEY_FOR = uid => `vaultquest_v1_${uid}`;
const LANG_KEY = 'vaultquest_lang';

const defaultState = {
  totalXP:0, level:1, streak:0, maxStreak:0,
  answeredQuestions:{}, chapterProgress:{}, badges:[], examHistory:[],
};

const TIPS = {
  en:[
    "Cubbyhole SE is the ONLY one enabled by default",
    "KVv2 API paths require 'data/' prefix: /v1/secret/data/mypath",
    "Batch tokens are lightweight but NOT renewable",
    "vault operator init -key-shares=5 -key-threshold=3 is the gold standard",
    "Request forwarding is Vault HA's default — no load balancer needed",
    "DR replication wipes ALL secondary data on activation",
    "Transit SE can auto-unseal other Vault clusters",
    "Namespaces enable true multi-tenancy within one cluster",
    "Auto Unseal config lives in the HCL server config file, not vault operator init",
    "Sentinel policies support time-based and MFA conditions — ACL policies cannot",
    "Vault telemetry is configured in the HCL config file — not via the API",
    "vault operator rekey changes unseal keys; vault operator rotate changes the storage encryption key",
    "Performance standby nodes handle reads locally but forward writes to the active node",
    "Vault Agent auto-auth solves secret zero at runtime — apps just read from the token sink file",
  ],
  fr:[
    "Le Cubbyhole est le SEUL moteur de secrets activé par défaut",
    "Les chemins API KVv2 nécessitent le préfixe 'data/' : /v1/secret/data/monchemin",
    "Les tokens Batch sont légers mais NON renouvelables",
    "vault operator init -key-shares=5 -key-threshold=3 est la référence en production",
    "La redirection de requêtes est le défaut de Vault HA — pas besoin de load balancer",
    "La réplication DR efface TOUTES les données du secondaire à l'activation",
    "Le moteur Transit peut auto-unsealer d'autres clusters Vault",
    "Les Namespaces permettent une vraie multi-location au sein d'un seul cluster",
    "La config Auto Unseal se trouve dans le fichier HCL du serveur, pas dans vault operator init",
    "Les politiques Sentinel supportent les conditions temporelles et MFA — les ACL ne peuvent pas",
    "La télémétrie Vault est configurée dans le fichier HCL — pas via l'API",
    "vault operator rekey change les clés de déverrouillage ; vault operator rotate change la clé de chiffrement du stockage",
    "Les nœuds performance standby traitent les lectures localement mais transmettent les écritures au nœud actif",
    "Le auto-auth de Vault Agent résout le problème du secret zéro — les apps lisent simplement depuis le fichier token sink",
  ],
};

const MOTIVATION = {
  en:[
    "Almost there, Vault warrior! 💪 The vault doesn't give up its secrets easily.",
    "The best operators learned from mistakes too! 🔐 Let's review and move forward.",
    "One step closer to mastery! 🎯 Every wrong answer is a concept you now won't forget.",
    "Even senior Vault engineers had to study this! 📚 You're building real expertise.",
    "The certification exam is tough — that's why you're practicing now! ⚡ Keep going.",
  ],
  fr:[
    "Presque là, guerrier du Vault ! 💪 Le coffre ne livre pas ses secrets facilement.",
    "Les meilleurs opérateurs ont aussi appris de leurs erreurs ! 🔐 On avance ensemble.",
    "Un pas de plus vers la maîtrise ! 🎯 Chaque mauvaise réponse est un concept gravé en mémoire.",
    "Même les ingénieurs Vault seniors ont dû étudier ça ! 📚 Tu construis une vraie expertise.",
    "L'examen de certification est difficile — c'est pourquoi tu t'entraînes maintenant ! ⚡ Continue.",
  ],
};

const CHAPTERS = {
  en:[
    {id:1,emoji:"🔧",title:"Secret Engines",       xpReward:100,stars:1},
    {id:2,emoji:"🔒",title:"Production Hardening", xpReward:150,stars:2},
    {id:3,emoji:"🛡️",title:"Security Model",        xpReward:150,stars:2},
    {id:4,emoji:"📜",title:"Tokens & Policies",    xpReward:200,stars:3},
    {id:5,emoji:"⚡",title:"HA & Fault Tolerance", xpReward:200,stars:3},
    {id:6,emoji:"🌐",title:"DR Replication",       xpReward:250,stars:4},
    {id:7,emoji:"🔑",title:"HSM Integration",      xpReward:250,stars:4},
    {id:8,emoji:"🚀",title:"Namespaces & Sentinel",xpReward:300,stars:5},
    {id:9,emoji:"📊",title:"Monitoring & Audit",   xpReward:250,stars:4},
    {id:10,emoji:"🤖",title:"Vault Agent",          xpReward:200,stars:3},
  ],
  fr:[
    {id:1,emoji:"🔧",title:"Moteurs de Secrets",       xpReward:100,stars:1},
    {id:2,emoji:"🔒",title:"Durcissement en Prod",     xpReward:150,stars:2},
    {id:3,emoji:"🛡️",title:"Modèle de Sécurité",       xpReward:150,stars:2},
    {id:4,emoji:"📜",title:"Tokens & Politiques",      xpReward:200,stars:3},
    {id:5,emoji:"⚡",title:"HA & Tolérance aux Pannes", xpReward:200,stars:3},
    {id:6,emoji:"🌐",title:"Réplication DR",           xpReward:250,stars:4},
    {id:7,emoji:"🔑",title:"Intégration HSM",          xpReward:250,stars:4},
    {id:8,emoji:"🚀",title:"Namespaces & Sentinel",    xpReward:300,stars:5},
    {id:9,emoji:"📊",title:"Monitoring & Audit",       xpReward:250,stars:4},
    {id:10,emoji:"🤖",title:"Vault Agent",             xpReward:200,stars:3},
  ],
};

const BADGES = {
  en:["🔑 Cubbyhole Keeper","🛡️ Hardening Hero","🔒 Security Sentinel","📜 Policy Paladin","⚡ HA Commander","🌐 DR Defender","🔐 HSM Handler","🚀 Namespace Navigator","📊 Telemetry Tracker","🤖 Agent Architect"],
  fr:["🔑 Gardien Cubbyhole","🛡️ Héros du Durcissement","🔒 Sentinelle Sécurité","📜 Paladin des Politiques","⚡ Commandant HA","🌐 Défenseur DR","🔐 Maître HSM","🚀 Navigateur Namespace","📊 Traqueur de Télémétrie","🤖 Architecte Agent"],
};

const QUESTIONS = {
  en:{
    1:[
      {id:"1-1",type:"MCQ",text:"Which secret engine is enabled by default in every Vault instance?",options:["KV v2","Cubbyhole","Transit","AWS"],correct:1,xp:25,explanation:"Cubbyhole is the ONLY SE enabled by default. It's token-scoped: the data is destroyed when the token expires. Even root cannot read data written by another token's cubbyhole."},
      {id:"1-2",type:"MCQ",text:"What command enables a KV secrets engine at a custom path named 'developers'?",options:["vault secrets enable kv","vault secrets enable -path=developers kv-v2","vault kv enable developers","vault mount kv2 developers"],correct:1,xp:25,explanation:"vault secrets enable -path=developers kv-v2 mounts KVv2 at the 'developers' path. The -path flag is essential — without it, the engine mounts at the default path for that engine type."},
      {id:"1-3",type:"TERMINAL",text:"Type the vault CLI command to list all enabled secrets engines with their detailed metadata.",correct:"vault secrets list --detailed",xp:30,explanation:"The --detailed flag adds columns like accessor, default TTL, max TTL, and description to the output. Essential for auditing your Vault configuration."},
      {id:"1-4",type:"TRUE_FALSE",text:"In KV version 2 (KVv2), all API calls require adding 'data/' to the path (e.g. /v1/secret/data/mypath instead of /v1/secret/mypath).",correct:true,xp:20,explanation:"KVv2 uses versioned paths. Use /v1/secret/data/mypath for read/write operations and /v1/secret/metadata/mypath for metadata and version history. Forgetting 'data/' is a very common mistake."},
    ],
    2:[
      {id:"2-1",type:"MCQ",text:"What is the default Vault API listener port?",options:["8080","8200","8201","9200"],correct:1,xp:20,explanation:"8200 is the Vault API port. Port 8201 is used for cluster replication traffic. These are important defaults for firewall rules."},
      {id:"2-2",type:"MCQ",text:"Which upgrade strategy is recommended for Vault in production?",options:["In-place upgrade (stop, replace binary, restart)","Immutable upgrades (bring new nodes online, destroy old)","Rolling restart across cluster nodes","Blue-green via load balancer"],correct:1,xp:30,explanation:"Immutable upgrades guarantee a known state — you deploy fresh, automation-configured nodes instead of mutating existing ones. This eliminates configuration drift and unknown states."},
      {id:"2-3",type:"TRUE_FALSE",text:"HashiCorp recommends running Vault as the root system user for maximum filesystem access.",correct:false,xp:20,explanation:"Never run Vault as root. Create a dedicated 'vault' user with minimal permissions. Root execution massively expands the blast radius of any security incident."},
      {id:"2-4",type:"MCQ",text:"Which port is dedicated to Vault cluster replication and inter-node communication?",options:["8200","8201","8300","8500"],correct:1,xp:25,explanation:"8201 is the cluster port used for request forwarding and replication. It requires separate firewall rules from the API port 8200."},
      {id:"2-5",type:"MCQ",text:"Vault supports both 'rekey' and 'rotate' operations. What is the key difference between them?",options:["Rekey rotates the encryption key for storage data; rotate generates new unseal keys","Rekey generates a new root key and new unseal/recovery keys; rotate changes the encryption key used to encrypt data written to the storage backend","Rekey and rotate perform the same operation but with different quorum thresholds","Rekey generates a new root key; rotate generates new unseal/recovery keys"],correct:1,xp:30,explanation:"vault operator rekey creates a new master key and distributes new unseal key shares — changing what key holders hold. vault operator rotate creates a new encryption key for the storage backend; existing data is re-encrypted on next access. Both are separate, critical maintenance operations serving very different purposes."},
      {id:"2-6",type:"TERMINAL",text:"Type the command to initiate a Vault rekey operation generating 5 new key shares with a threshold of 3.",correct:"vault operator rekey -init -key-shares=5 -key-threshold=3",xp:35,explanation:"vault operator rekey -init starts the rekey process. Each existing unseal key holder must submit their current key to reach the threshold, then new shares are distributed. Use -pgp-keys to encrypt each new share for a specific recipient's PGP key for secure distribution."},
    ],
    3:[
      {id:"3-1",type:"MCQ",text:"What problem does 'secure introduction' solve in HashiCorp Vault?",options:["How to encrypt the Vault binary on disk","How a new workload authenticates to Vault without pre-shared secrets (the 'secret zero' problem)","How to enable TLS on the Vault listener","How to configure HSM auto-unseal"],correct:1,xp:30,explanation:"Secure introduction solves the 'secret zero' problem: how does a fresh workload get its very first Vault token? Solutions include AppRole (with secure RoleID/SecretID delivery), cloud auth methods (AWS/GCP/Azure), and Kubernetes auth via service accounts."},
      {id:"3-2",type:"TRUE_FALSE",text:"Running Vault in Kubernetes can expose Vault tokens in environment variables if not configured carefully.",correct:true,xp:25,explanation:"Environment variables in K8s pods are visible to anyone who can exec into the pod. Use the Vault Agent Sidecar or Vault Secrets Operator to inject secrets directly into files, avoiding environment variable exposure entirely."},
      {id:"3-3",type:"MCQ",text:"Which Vault auth method allows Kubernetes pods to authenticate using their native service account JWT tokens?",options:["AppRole","AWS IAM","Kubernetes","JWT/OIDC"],correct:2,xp:25,explanation:"The Kubernetes auth method validates the pod's service account JWT against the K8s API server. No pre-shared secrets needed — the pod's identity is verified by Kubernetes itself."},
      {id:"3-4",type:"MCQ",text:"What is the primary security benefit of response wrapping?",options:["It encrypts secrets at rest in storage","It protects secrets in transit from man-in-the-middle interception by returning a single-use token instead of the secret","It prevents replay attacks on the Vault API","It enforces token TTL limits"],correct:1,xp:25,explanation:"Response wrapping returns a single-use wrapping token instead of the actual secret. Only the intended recipient can unwrap it — and only once. Even if intercepted during delivery, the token is useless after first use."},
    ],
    4:[
      {id:"4-1",type:"MCQ",text:"Which Vault token type is NOT renewable and is designed for high-throughput, short-lived workloads?",options:["Service token","Root token","Batch token","Periodic token"],correct:2,xp:30,explanation:"Batch tokens are lightweight, encrypted blobs — not stored in Vault backend. They cannot be renewed, looked up, or revoked individually. Perfect for high-volume workloads where token management overhead would be significant."},
      {id:"4-2",type:"TERMINAL",text:"Write the vault CLI command to create a policy named 'app-policy' from a local file called 'policy.hcl'.",correct:"vault policy write app-policy policy.hcl",xp:30,explanation:"vault policy write uploads a policy from a local HCL file. The policy defines path-based capabilities (read, write, list, delete, create, update, patch, sudo, deny). Policies are attached to tokens at creation time."},
      {id:"4-3",type:"MCQ",text:"Which ACL capability is required to perform sensitive operations like sealing Vault or modifying token TTLs on privileged paths?",options:["update","create","sudo","root"],correct:2,xp:25,explanation:"The 'sudo' capability grants elevated permission to access root-protected paths like sys/seal, sys/raw, and auth/token/root. It's intentionally separate from standard CRUD capabilities."},
      {id:"4-4",type:"TRUE_FALSE",text:"An orphan token's lifecycle is independent of its parent token — it does NOT get revoked when the parent token is revoked.",correct:true,xp:20,explanation:"Normal tokens form a parent-child hierarchy: revoking a parent revokes all children. Orphan tokens break this chain. They're created with vault token create -orphan or by auth methods configured to produce orphan tokens."},
      {id:"4-5",type:"MCQ",text:"How does the 'deny' capability in an ACL policy affect a user's access in Vault?",options:["It must be combined with the 'allow' capability to be effective","It overrides any other policies that grant access","It allows access to all paths except the specified ones","It only applies if no other policies grant access"],correct:1,xp:25,explanation:"'deny' is an absolute override in Vault ACL — it takes precedence over all other capabilities from all policies attached to the same token. Even if another policy grants 'read' on the same path, a single 'deny' blocks the operation entirely. It is the highest-priority capability in Vault's ACL system."},
      {id:"4-6",type:"MCQ",text:"What is the 'default' policy in Vault and what does it grant?",options:["root policy; grants full administrative access","default policy; grants full access to all secrets","read-only policy; grants read access to all secrets","default policy; grants access to the sys/ and auth/ paths"],correct:3,xp:25,explanation:"Every Vault token automatically inherits the 'default' policy unless explicitly excluded. It grants limited access to sys/ and auth/ paths — allowing tokens to look up their own properties, renew themselves, and revoke themselves. It does NOT grant any access to user secrets. The root policy grants unrestricted access."},
    ],
    5:[
      {id:"5-1",type:"MCQ",text:"What is Vault's default method for handling client requests in an HA cluster?",options:["Client redirection to the active node","Load balancing across all nodes","Request forwarding — standby nodes forward to active","Gossip protocol routing"],correct:2,xp:30,explanation:"With request forwarding, the entire cluster appears as a single server. Clients connect to any node; standby nodes transparently forward to the active node. If forwarding fails, Vault falls back to client redirection."},
      {id:"5-2",type:"TERMINAL",text:"Type the command to join a new Vault node to an existing Raft integrated storage cluster.",correct:"vault operator raft join https://active-vault:8200",xp:35,explanation:"vault operator raft join connects a new node to an existing Raft cluster. The node you reference must be the active leader or an already-joined member. This is the standard way to scale a Raft-based Vault cluster."},
      {id:"5-3",type:"TRUE_FALSE",text:"HashiCorp recommends placing a load balancer in front of Vault HA clusters for high availability.",correct:false,xp:25,explanation:"HashiCorp explicitly does NOT recommend load balancers for Vault. Request forwarding makes the cluster act as a single server from the client's perspective. Load balancers add complexity and can interfere with the forwarding mechanism."},
      {id:"5-4",type:"MCQ",text:"What happens if request forwarding fails in a Vault HA cluster?",options:["Vault becomes sealed","The cluster elects a new leader immediately","Vault falls back to client redirection — it tells the client who the active node is","All standby nodes become active"],correct:2,xp:25,explanation:"Vault's fallback is client redirection: the standby node returns a 307 redirect to the active node's address. The client must then make a new request directly to the active node."},
      {id:"5-5",type:"MCQ",text:"Which of the following is true about Vault Enterprise Performance Standby Nodes?",options:["Performance standby nodes are only available when using the Consul storage backend","Performance standby nodes attempt to locally process read requests and automatically forward write requests to the active node","Performance standby nodes scale the cluster by handling both read and write requests locally","Performance standby nodes can only be used when Performance Replication is also enabled"],correct:1,xp:30,explanation:"Performance standby nodes (Vault Enterprise) locally process read requests without forwarding to the active node — significantly increasing cluster read throughput. Write requests are still forwarded to the active node. This differs from regular standby nodes which forward ALL requests. They do NOT require Performance Replication to be enabled."},
      {id:"5-6",type:"MCQ",text:"When configuring a Vault HA cluster, which storage backend is commonly recommended for high availability?",options:["MySQL","NFS","Consul","PostgreSQL"],correct:2,xp:25,explanation:"Consul (with Vault's Consul storage backend) is a battle-tested HA option. HashiCorp's integrated Raft storage is now the preferred choice for new deployments as it eliminates the external Consul dependency. Both provide distributed consensus. MySQL, NFS, and PostgreSQL are NOT recommended for production HA Vault deployments."},
    ],
    6:[
      {id:"6-1",type:"MCQ",text:"When Disaster Recovery (DR) replication is enabled on the primary cluster, what does Vault automatically create?",options:["A snapshot of all secrets","An internal root CA for mutual TLS between primary and secondary","A performance replica of all auth methods","A secondary unseal key share"],correct:1,xp:35,explanation:"Vault creates an internal root CA and establishes an mTLS connection between DR nodes using self-signed certificates. This is SEPARATE from the TLS configured on the listener — it's dedicated to replication traffic."},
      {id:"6-2",type:"TRUE_FALSE",text:"When DR replication is activated on a secondary cluster, all existing data on the secondary is immediately wiped.",correct:true,xp:30,explanation:"The secondary immediately syncs from the primary upon activation, which means ALL local data is overwritten. This is by design — the secondary becomes an exact replica of the primary. Always verify you're enabling replication on the correct cluster."},
      {id:"6-3",type:"MCQ",text:"What is required for a secondary cluster to begin replicating from the primary?",options:["The primary's root token","A secondary activation token (generated on primary, protected by response wrapping)","The primary's unseal keys","A shared storage backend"],correct:1,xp:30,explanation:"A secondary activation token is generated on the primary cluster and delivered to the secondary using response wrapping (to prevent interception). Without this token, the secondary cannot authenticate to the primary for replication."},
      {id:"6-4",type:"MCQ",text:"Which command promotes a DR secondary cluster to become the new primary?",options:["vault operator dr promote","vault operator generate-root -dr","vault replication promote --dr","vault operator raft promote"],correct:0,xp:25,explanation:"vault operator dr promote promotes a DR secondary to primary — used during disaster recovery when the original primary is unavailable. Requires a DR operation token with appropriate permissions."},
    ],
    7:[
      {id:"7-1",type:"MCQ",text:"What is the primary operational benefit of Auto Unseal with an HSM?",options:["Faster Vault startup times","Eliminates the need to gather unseal key holders after every restart or failure","Enables performance replication between clusters","Reduces the storage footprint of Vault data"],correct:1,xp:30,explanation:"With Shamir unseal, every restart requires gathering multiple key holders — a serious operational burden. Auto Unseal delegates the unsealing process to an external trusted service (HSM, AWS KMS, Azure Key Vault, GCP Cloud KMS), making restarts fully automated."},
      {id:"7-2",type:"MCQ",text:"Seal Wrap in Vault Enterprise uses which cryptographic standard for HSM integration?",options:["FIPS 140-2","PKCS#11","OpenSSL PKCS#8","TPM 2.0"],correct:1,xp:30,explanation:"PKCS#11 is the standard interface for communicating with HSMs. Vault's seal wrap functionality wraps sensitive values with an additional layer of HSM-managed encryption, providing hardware-rooted security for the most sensitive Vault data."},
      {id:"7-3",type:"TRUE_FALSE",text:"The Vault Transit secrets engine can be used to auto-unseal another Vault cluster (Transit auto-unseal).",correct:true,xp:25,explanation:"Transit auto-unseal allows one Vault cluster (the 'transit Vault') to unseal another. The unsealing Vault uses the Transit SE as an encryption oracle. Useful in environments without HSMs but requiring automated unsealing."},
      {id:"7-4",type:"MCQ",text:"Where must Auto Unseal be configured in a Vault deployment?",options:["via vault operator init flags","In the Vault server HCL configuration file (seal stanza)","via vault secrets enable","via vault auth enable at runtime"],correct:1,xp:25,explanation:"Auto Unseal is configured in the server's HCL config file using a seal stanza (e.g., seal 'awskms' { region = '...' kms_key_id = '...' }). It is set BEFORE initialization, not during vault operator init."},
    ],
    8:[
      {id:"8-1",type:"MCQ",text:"Which Vault Enterprise feature creates isolated environments with their own auth methods, policies, and secret engines within a single cluster?",options:["Control Groups","Namespaces","Performance Replication","Sentinel EGP policies"],correct:1,xp:35,explanation:"Namespaces create fully isolated Vault tenants within one cluster — each with independent secrets, policies, tokens, and auth methods. They enable true multi-tenancy and simplify managing multiple teams or environments on shared infrastructure."},
      {id:"8-2",type:"MCQ",text:"What capability do Vault Enterprise Sentinel policies provide that ACL policies cannot?",options:["Faster policy evaluation","Fine-grained logic including time-of-day, day-of-week, and MFA conditions","Recursive policy inheritance across namespaces","Lower memory overhead per token"],correct:1,xp:35,explanation:"Sentinel is a policy-as-code framework enabling logic like: 'only allow secret access between 9am-5pm on weekdays' or 'require MFA for write operations'. ACL policies are path + capability only — they have no conditional logic."},
      {id:"8-3",type:"TRUE_FALSE",text:"Control Groups in Vault Enterprise implement a 'four-eyes principle' requiring approval from multiple authorized humans before a secret is released.",correct:true,xp:30,explanation:"Control Groups add a human approval layer on top of standard policies. A request for a secret is held until the configured number of authorizers explicitly approve it. Critical for compliance scenarios requiring dual-control over sensitive operations."},
      {id:"8-4",type:"MCQ",text:"What is a 'paths filter' in Vault Enterprise performance replication?",options:["A network firewall rule for the replication port","A way to selectively replicate only specific secret paths to performance secondary clusters","An audit device filter for compliance logging","A rate limiter for API calls on secondary nodes"],correct:1,xp:30,explanation:"Paths filters let you include or exclude specific mount paths from performance replication. Useful when different geographic regions should only have access to relevant secrets — reducing data surface area and improving compliance posture."},
    ],
    9:[
      {id:"9-1",type:"MCQ",text:"Where do you configure Vault telemetry settings to forward metrics to a collector agent?",options:["sys/telemetry","sys/tools/telemetry","In the Vault UI under the 'Status' menu","In the Vault configuration file (HCL)"],correct:3,xp:25,explanation:"Telemetry is configured in the Vault server HCL configuration file under the telemetry stanza (e.g., telemetry { prometheus_retention_time = '30s' }). It cannot be configured via the Vault API or UI. Supported sinks include Prometheus, StatsD, DogStatsD, and Circonus."},
      {id:"9-2",type:"MCQ",text:"What is the primary difference between Vault audit logs and Vault operational logs?",options:["Audit logs capture admin actions; operational logs capture user actions","Audit logs record every Vault request and response; operational logs record server-side events like startup, errors, and warnings","Operational logs are stored encrypted; audit logs are plaintext","Audit logs are only available in Vault Enterprise"],correct:1,xp:30,explanation:"Audit logs are a complete, tamper-evident record of every API request and response — essential for compliance. Operational logs are standard server logs (INFO/WARN/ERROR) about Vault's own functioning: startup, config loading, replication status. Both are critical but serve different purposes."},
      {id:"9-3",type:"TERMINAL",text:"Type the command to enable a file audit device that writes to /var/log/vault_audit.log.",correct:"vault audit enable file file_path=/var/log/vault_audit.log",xp:35,explanation:"vault audit enable creates an audit device. The 'file' type writes to a local file path. Other types are 'syslog' (system syslog daemon) and 'socket' (TCP/UDP). CRITICAL: if ALL audit devices become unavailable, Vault stops processing requests (fail-closed). Always configure at least 2 audit devices in production."},
      {id:"9-4",type:"TRUE_FALSE",text:"If all configured audit devices become unavailable, Vault continues processing requests to ensure service availability.",correct:false,xp:25,explanation:"Vault is fail-closed for audit logging. If every audit device fails simultaneously, Vault stops processing new requests rather than allow unlogged operations. This is a deliberate security design — no Vault operation should go unaudited. Configure multiple audit devices (e.g., file + syslog) for resilience."},
    ],
    10:[
      {id:"10-1",type:"MCQ",text:"What is the primary role of Vault Agent's auto-auth feature?",options:["It automatically rotates secrets on a schedule","It automatically authenticates to Vault and maintains a valid token without human intervention","It auto-generates policies based on workload behavior","It automatically unseals Vault after a restart"],correct:1,xp:30,explanation:"Auto-auth solves the 'secret zero' problem at the application level: Vault Agent authenticates using a configured method (Kubernetes service account, AWS IAM, AppRole, etc.) and keeps a valid, renewed token available in a token sink file. Applications read from this file instead of authenticating directly to Vault — eliminating credential management from app code."},
      {id:"10-2",type:"MCQ",text:"Given this Vault Agent template: {{ with secret \"secret/data/app\" }} ID: {{ .Data.data.username }} Color: {{ .Data.data.color }} {{ end }} — which statement is NOT valid?",options:["The secret in Vault contains a key with the name username","The secret in Vault contains a key with the name color","The secret in Vault contains a key with the name ID","The path of the secret in Vault is secret/data/app"],correct:2,xp:35,explanation:"'ID:' in the template is a static label in the rendered output file — it is NOT a Vault secret key. The actual Vault keys accessed are 'username' (via .Data.data.username) and 'color' (via .Data.data.color). The 'ID:' prefix is plain text written to the output file. This is a classic exam trap: template labels ≠ Vault key names."},
      {id:"10-3",type:"MCQ",text:"What is the purpose of the 'token_sink' in Vault Agent configuration?",options:["It discards expired tokens automatically","It writes the current Vault token to a file so applications can read it without authenticating directly to Vault","It sends tokens to a remote Vault cluster for validation","It rotates the agent's token on a defined schedule"],correct:1,xp:25,explanation:"The token sink is a file (or other destination) where Vault Agent writes its current valid token. Applications read this file to obtain a Vault token — decoupling the authentication mechanism from application code. The agent handles renewal; the app simply reads the token file. This is the core of Vault Agent's secret zero solution."},
      {id:"10-4",type:"TRUE_FALSE",text:"Vault Agent can automatically re-authenticate to Vault if its current token expires or is revoked.",correct:true,xp:25,explanation:"Vault Agent's auto-auth continuously monitors the token TTL and renews it proactively. If renewal fails (max TTL reached or token revoked), the agent re-authenticates from scratch using the configured auth method. This provides fully hands-free token lifecycle management — no operator intervention required."},
    ],
  },
  fr:{
    1:[
      {id:"1-1",type:"MCQ",text:"Quel moteur de secrets est activé par défaut dans chaque instance Vault ?",options:["KV v2","Cubbyhole","Transit","AWS"],correct:1,xp:25,explanation:"Cubbyhole est le SEUL moteur de secrets activé par défaut. Il est scopé au token : les données sont détruites à l'expiration du token. Même root ne peut pas lire les données d'un cubbyhole appartenant à un autre token."},
      {id:"1-2",type:"MCQ",text:"Quelle commande active un moteur de secrets KV à un chemin personnalisé nommé 'developers' ?",options:["vault secrets enable kv","vault secrets enable -path=developers kv-v2","vault kv enable developers","vault mount kv2 developers"],correct:1,xp:25,explanation:"vault secrets enable -path=developers kv-v2 monte KVv2 au chemin 'developers'. Le flag -path est essentiel — sans lui, le moteur est monté au chemin par défaut pour ce type de moteur."},
      {id:"1-3",type:"TERMINAL",text:"Tapez la commande vault CLI pour lister tous les moteurs de secrets activés avec leurs métadonnées détaillées.",correct:"vault secrets list --detailed",xp:30,explanation:"Le flag --detailed ajoute des colonnes comme l'accesseur, le TTL par défaut, le TTL maximum et la description. Indispensable pour auditer la configuration de votre Vault."},
      {id:"1-4",type:"TRUE_FALSE",text:"Dans KV version 2 (KVv2), tous les appels API nécessitent d'ajouter 'data/' au chemin (ex. /v1/secret/data/monchemin au lieu de /v1/secret/monchemin).",correct:true,xp:20,explanation:"KVv2 utilise des chemins versionnés. Utilisez /v1/secret/data/monchemin pour les opérations de lecture/écriture et /v1/secret/metadata/monchemin pour les métadonnées. Oublier 'data/' est une erreur très courante."},
    ],
    2:[
      {id:"2-1",type:"MCQ",text:"Quel est le port d'écoute API par défaut de Vault ?",options:["8080","8200","8201","9200"],correct:1,xp:20,explanation:"8200 est le port API de Vault. Le port 8201 est utilisé pour le trafic de réplication du cluster. Ce sont des valeurs par défaut importantes pour les règles de pare-feu."},
      {id:"2-2",type:"MCQ",text:"Quelle stratégie de mise à jour est recommandée pour Vault en production ?",options:["Mise à jour en place (arrêt, remplacement du binaire, redémarrage)","Mises à jour immuables (nouveaux nœuds en ligne, destruction des anciens)","Redémarrage progressif des nœuds du cluster","Blue-green via load balancer"],correct:1,xp:30,explanation:"Les mises à jour immuables garantissent un état connu — vous déployez des nœuds neufs configurés par automatisation au lieu de muter les existants. Cela élimine la dérive de configuration et les états inconnus."},
      {id:"2-3",type:"TRUE_FALSE",text:"HashiCorp recommande d'exécuter Vault en tant qu'utilisateur root pour un accès maximal au système de fichiers.",correct:false,xp:20,explanation:"Ne jamais exécuter Vault en tant que root. Créez un utilisateur dédié 'vault' avec des permissions minimales. L'exécution en root élargit massivement le rayon d'impact d'un incident de sécurité."},
      {id:"2-4",type:"MCQ",text:"Quel port est dédié à la réplication du cluster Vault et à la communication inter-nœuds ?",options:["8200","8201","8300","8500"],correct:1,xp:25,explanation:"8201 est le port de cluster utilisé pour la redirection de requêtes et la réplication. Il nécessite des règles de pare-feu séparées du port API 8200."},
      {id:"2-5",type:"MCQ",text:"Vault prend en charge les opérations 'rekey' et 'rotate'. Quelle est la différence clé entre elles ?",options:["Rekey fait pivoter la clé de chiffrement des données en stockage ; rotate génère de nouvelles clés de déverrouillage","Rekey génère une nouvelle clé root et de nouvelles clés de déverrouillage/récupération ; rotate change la clé de chiffrement utilisée pour chiffrer les données écrites dans le backend de stockage","Rekey et rotate effectuent la même opération mais avec des seuils de quorum différents","Rekey génère une nouvelle clé root ; rotate génère de nouvelles clés de déverrouillage/récupération"],correct:1,xp:30,explanation:"vault operator rekey crée une nouvelle clé maître et distribue de nouveaux fragments de clé — changeant ce que les détenteurs possèdent. vault operator rotate crée une NOUVELLE clé de chiffrement pour le backend de stockage ; les données existantes sont rechiffrées lors du prochain accès. Ce sont deux opérations de maintenance distinctes et critiques servant des objectifs très différents."},
      {id:"2-6",type:"TERMINAL",text:"Tapez la commande pour initier une opération de rekey Vault générant 5 nouveaux fragments de clé avec un seuil de 3.",correct:"vault operator rekey -init -key-shares=5 -key-threshold=3",xp:35,explanation:"vault operator rekey -init démarre le processus de rekey. Chaque détenteur de clé de déverrouillage soumet sa clé actuelle pour atteindre le seuil, puis de nouveaux fragments sont distribués. Utilisez -pgp-keys pour chiffrer chaque nouveau fragment avec la clé PGP du destinataire pour une distribution sécurisée."},
    ],
    3:[
      {id:"3-1",type:"MCQ",text:"Quel problème résout l''introduction sécurisée' dans HashiCorp Vault ?",options:["Comment chiffrer le binaire Vault sur disque","Comment un nouveau workload s'authentifie à Vault sans secrets partagés préalablement (le problème du 'secret zéro')","Comment activer TLS sur le listener Vault","Comment configurer l'auto-unseal HSM"],correct:1,xp:30,explanation:"L'introduction sécurisée résout le problème du 'secret zéro' : comment un workload tout neuf obtient-il son tout premier token Vault ? Les solutions incluent AppRole, les méthodes d'auth cloud (AWS/GCP/Azure) et l'auth Kubernetes via les comptes de service."},
      {id:"3-2",type:"TRUE_FALSE",text:"Exécuter Vault dans Kubernetes peut exposer des tokens Vault dans des variables d'environnement si la configuration n'est pas soigneuse.",correct:true,xp:25,explanation:"Les variables d'environnement dans les pods K8s sont visibles par quiconque peut exec dans le pod. Utilisez le Vault Agent Sidecar ou le Vault Secrets Operator pour injecter les secrets directement dans des fichiers."},
      {id:"3-3",type:"MCQ",text:"Quelle méthode d'authentification Vault permet aux pods Kubernetes de s'authentifier via leurs tokens JWT de compte de service natifs ?",options:["AppRole","AWS IAM","Kubernetes","JWT/OIDC"],correct:2,xp:25,explanation:"La méthode d'auth Kubernetes valide le JWT du compte de service du pod auprès de l'API server K8s. Aucun secret partagé préalable requis — l'identité du pod est vérifiée par Kubernetes lui-même."},
      {id:"3-4",type:"MCQ",text:"Quel est le principal avantage de sécurité du 'response wrapping' ?",options:["Il chiffre les secrets au repos dans le stockage","Il protège les secrets en transit contre l'interception en retournant un token à usage unique au lieu du secret","Il prévient les attaques par rejeu sur l'API Vault","Il impose des limites de TTL aux tokens"],correct:1,xp:25,explanation:"Le response wrapping retourne un token d'emballage à usage unique au lieu du secret réel. Seul le destinataire prévu peut le déballer — et une seule fois. Même intercepté lors de la livraison, le token est inutilisable après son premier usage."},
    ],
    4:[
      {id:"4-1",type:"MCQ",text:"Quel type de token Vault n'est PAS renouvelable et est conçu pour des workloads haute fréquence à durée de vie courte ?",options:["Token de service","Token root","Token Batch","Token périodique"],correct:2,xp:30,explanation:"Les tokens Batch sont des blobs chiffrés légers — non stockés dans le backend Vault. Ils ne peuvent pas être renouvelés, consultés ou révoqués individuellement. Parfaits pour les workloads à fort volume où la surcharge de gestion des tokens serait significative."},
      {id:"4-2",type:"TERMINAL",text:"Écrivez la commande vault CLI pour créer une politique nommée 'app-policy' depuis un fichier local 'policy.hcl'.",correct:"vault policy write app-policy policy.hcl",xp:30,explanation:"vault policy write télécharge une politique depuis un fichier HCL local. La politique définit des capacités basées sur les chemins (read, write, list, delete, create, update, patch, sudo, deny). Les politiques sont attachées aux tokens lors de leur création."},
      {id:"4-3",type:"MCQ",text:"Quelle capacité ACL est requise pour effectuer des opérations sensibles comme sceller Vault ou modifier les TTL de tokens sur des chemins privilégiés ?",options:["update","create","sudo","root"],correct:2,xp:25,explanation:"La capacité 'sudo' accorde une permission élevée pour accéder aux chemins protégés root comme sys/seal, sys/raw et auth/token/root. Elle est intentionnellement séparée des capacités CRUD standard."},
      {id:"4-4",type:"TRUE_FALSE",text:"Le cycle de vie d'un token orphelin est indépendant de son token parent — il N'EST PAS révoqué quand le token parent est révoqué.",correct:true,xp:20,explanation:"Les tokens normaux forment une hiérarchie parent-enfant : révoquer un parent révoque tous les enfants. Les tokens orphelins rompent cette chaîne. Ils sont créés avec vault token create -orphan ou par des méthodes d'auth configurées pour produire des tokens orphelins."},
      {id:"4-5",type:"MCQ",text:"Comment la capacité 'deny' dans une politique ACL affecte-t-elle l'accès d'un utilisateur dans Vault ?",options:["Elle doit être combinée avec la capacité 'allow' pour être efficace","Elle remplace toutes les autres politiques qui accordent l'accès","Elle permet l'accès à tous les chemins sauf les chemins spécifiés","Elle ne s'applique que si aucune autre politique n'accorde l'accès"],correct:1,xp:25,explanation:"'deny' est un override absolu dans les ACL Vault — il a priorité sur toutes les autres capacités de toutes les politiques attachées au même token. Même si une autre politique accorde 'read' sur le même chemin, un seul 'deny' bloque complètement l'opération. C'est la capacité de plus haute priorité dans le système ACL de Vault."},
      {id:"4-6",type:"MCQ",text:"Qu'est-ce que la politique 'default' dans Vault et qu'accorde-t-elle ?",options:["La politique root ; accorde un accès administratif total","La politique default ; accorde un accès complet à tous les secrets","La politique read-only ; accorde un accès en lecture à tous les secrets","La politique default ; accorde l'accès aux chemins sys/ et auth/"],correct:3,xp:25,explanation:"Chaque token Vault hérite automatiquement de la politique 'default' sauf exclusion explicite. Elle accorde un accès limité aux chemins sys/ et auth/ — permettant aux tokens de consulter leurs propres propriétés, se renouveler et se révoquer. Elle n'accorde AUCUN accès aux secrets utilisateur. La politique root accorde un accès illimité."},
    ],
    5:[
      {id:"5-1",type:"MCQ",text:"Quelle est la méthode par défaut de Vault pour gérer les requêtes clients dans un cluster HA ?",options:["Redirection du client vers le nœud actif","Équilibrage de charge sur tous les nœuds","Redirection de requêtes — les nœuds standby transmettent au nœud actif","Routage par protocole Gossip"],correct:2,xp:30,explanation:"Avec la redirection de requêtes, tout le cluster apparaît comme un seul serveur. Les clients se connectent à n'importe quel nœud ; les nœuds standby transmettent de façon transparente au nœud actif. En cas d'échec, Vault bascule sur la redirection client."},
      {id:"5-2",type:"TERMINAL",text:"Tapez la commande pour joindre un nouveau nœud Vault à un cluster Raft intégré existant.",correct:"vault operator raft join https://active-vault:8200",xp:35,explanation:"vault operator raft join connecte un nouveau nœud à un cluster Raft existant. Le nœud référencé doit être le leader actif ou un membre déjà joint. C'est la méthode standard pour faire évoluer un cluster Vault basé sur Raft."},
      {id:"5-3",type:"TRUE_FALSE",text:"HashiCorp recommande de placer un load balancer devant les clusters Vault HA pour la haute disponibilité.",correct:false,xp:25,explanation:"HashiCorp ne recommande EXPLICITEMENT PAS les load balancers pour Vault. La redirection de requêtes fait apparaître le cluster comme un seul serveur du point de vue du client. Les load balancers ajoutent de la complexité et peuvent interférer avec le mécanisme de redirection."},
      {id:"5-4",type:"MCQ",text:"Que se passe-t-il si la redirection de requêtes échoue dans un cluster Vault HA ?",options:["Vault est scellé","Le cluster élit immédiatement un nouveau leader","Vault bascule sur la redirection client — il indique au client quel est le nœud actif","Tous les nœuds standby deviennent actifs"],correct:2,xp:25,explanation:"Le repli de Vault est la redirection client : le nœud standby retourne une redirection 307 vers l'adresse du nœud actif. Le client doit alors faire une nouvelle requête directement vers le nœud actif."},
      {id:"5-5",type:"MCQ",text:"Laquelle des affirmations suivantes est vraie concernant les nœuds Performance Standby de Vault Enterprise ?",options:["Les nœuds performance standby ne sont disponibles qu'avec le backend de stockage Consul","Les nœuds performance standby traitent localement les requêtes de lecture et transmettent automatiquement les requêtes d'écriture au nœud actif","Les nœuds performance standby font évoluer le cluster en traitant localement les requêtes de lecture et d'écriture","Les nœuds performance standby ne peuvent être utilisés que lorsque la réplication de performance est également activée"],correct:1,xp:30,explanation:"Les nœuds performance standby (Vault Enterprise) traitent localement les requêtes de lecture sans les transmettre au nœud actif — augmentant significativement le débit de lecture du cluster. Les requêtes d'écriture sont toujours transmises au nœud actif. Cela diffère des nœuds standby réguliers qui transmettent TOUTES les requêtes. Ils ne nécessitent PAS l'activation de la réplication de performance."},
      {id:"5-6",type:"MCQ",text:"Lors de la configuration d'un cluster Vault HA, quel backend de stockage est couramment recommandé pour assurer la haute disponibilité ?",options:["MySQL","NFS","Consul","PostgreSQL"],correct:2,xp:25,explanation:"Consul (avec le backend de stockage Consul de Vault) est une option HA éprouvée. Le stockage Raft intégré de HashiCorp est désormais le choix préféré pour les nouveaux déploiements car il élimine la dépendance externe à Consul. Les deux fournissent un consensus distribué. MySQL, NFS et PostgreSQL ne sont PAS recommandés pour les déploiements Vault HA en production."},
    ],
    6:[
      {id:"6-1",type:"MCQ",text:"Quand la réplication DR est activée sur le cluster primaire, que crée automatiquement Vault ?",options:["Un snapshot de tous les secrets","Une CA root interne pour le mTLS entre primaire et secondaire","Un réplica de performance de toutes les méthodes d'auth","Un fragment de clé de déverrouillage secondaire"],correct:1,xp:35,explanation:"Vault crée une CA root interne et établit une connexion mTLS entre les nœuds DR via des certificats auto-signés. Ceci est SÉPARÉ du TLS configuré sur le listener — c'est dédié au trafic de réplication."},
      {id:"6-2",type:"TRUE_FALSE",text:"Quand la réplication DR est activée sur un cluster secondaire, toutes les données existantes sur le secondaire sont immédiatement effacées.",correct:true,xp:30,explanation:"Le secondaire se synchronise immédiatement depuis le primaire à l'activation, ce qui signifie que TOUTES les données locales sont écrasées. C'est intentionnel — le secondaire devient un réplica exact du primaire. Vérifiez toujours que vous activez la réplication sur le bon cluster."},
      {id:"6-3",type:"MCQ",text:"Qu'est-ce qui est nécessaire pour qu'un cluster secondaire commence à répliquer depuis le primaire ?",options:["Le token root du primaire","Un token d'activation secondaire (généré sur le primaire, protégé par response wrapping)","Les clés de déverrouillage du primaire","Un backend de stockage partagé"],correct:1,xp:30,explanation:"Un token d'activation secondaire est généré sur le cluster primaire et livré au secondaire via response wrapping (pour éviter l'interception). Sans ce token, le secondaire ne peut pas s'authentifier auprès du primaire pour la réplication."},
      {id:"6-4",type:"MCQ",text:"Quelle commande promeut un cluster DR secondaire pour devenir le nouveau primaire ?",options:["vault operator dr promote","vault operator generate-root -dr","vault replication promote --dr","vault operator raft promote"],correct:0,xp:25,explanation:"vault operator dr promote promeut un DR secondaire en primaire — utilisé lors d'une reprise après sinistre quand le primaire original est indisponible. Nécessite un token d'opération DR avec les permissions appropriées."},
    ],
    7:[
      {id:"7-1",type:"MCQ",text:"Quel est le principal avantage opérationnel de l'Auto Unseal avec un HSM ?",options:["Démarrages de Vault plus rapides","Élimine le besoin de rassembler les détenteurs de clés de déverrouillage après chaque redémarrage ou panne","Active la réplication de performance entre clusters","Réduit l'empreinte de stockage des données Vault"],correct:1,xp:30,explanation:"Avec le déverrouillage Shamir, chaque redémarrage nécessite de rassembler plusieurs détenteurs de clés — une lourde charge opérationnelle. L'Auto Unseal délègue le processus de déverrouillage à un service externe de confiance (HSM, AWS KMS, Azure Key Vault, GCP Cloud KMS), rendant les redémarrages entièrement automatisés."},
      {id:"7-2",type:"MCQ",text:"Seal Wrap dans Vault Enterprise utilise quel standard cryptographique pour l'intégration HSM ?",options:["FIPS 140-2","PKCS#11","OpenSSL PKCS#8","TPM 2.0"],correct:1,xp:30,explanation:"PKCS#11 est l'interface standard pour communiquer avec les HSM. La fonctionnalité seal wrap de Vault enveloppe les valeurs sensibles avec une couche supplémentaire de chiffrement géré par le HSM, fournissant une sécurité ancrée dans le matériel pour les données Vault les plus sensibles."},
      {id:"7-3",type:"TRUE_FALSE",text:"Le moteur de secrets Transit de Vault peut être utilisé pour auto-unsealer un autre cluster Vault (Transit auto-unseal).",correct:true,xp:25,explanation:"Le Transit auto-unseal permet à un cluster Vault (le 'Vault transit') d'en unsealer un autre. Le Vault de déverrouillage utilise le Transit SE comme oracle de chiffrement. Utile dans les environnements sans HSM mais nécessitant un déverrouillage automatisé."},
      {id:"7-4",type:"MCQ",text:"Où doit être configuré l'Auto Unseal dans un déploiement Vault ?",options:["via les flags de vault operator init","Dans le fichier de configuration HCL du serveur Vault (stanza seal)","via vault secrets enable","via vault auth enable au moment de l'exécution"],correct:1,xp:25,explanation:"L'Auto Unseal est configuré dans le fichier HCL du serveur via une stanza seal (ex. seal 'awskms' { region = '...' kms_key_id = '...' }). Il est défini AVANT l'initialisation, pas pendant vault operator init."},
    ],
    8:[
      {id:"8-1",type:"MCQ",text:"Quelle fonctionnalité Vault Enterprise crée des environnements isolés avec leurs propres méthodes d'auth, politiques et moteurs de secrets au sein d'un seul cluster ?",options:["Control Groups","Namespaces","Réplication de Performance","Politiques Sentinel EGP"],correct:1,xp:35,explanation:"Les Namespaces créent des locataires Vault entièrement isolés au sein d'un cluster — chacun avec des secrets, politiques, tokens et méthodes d'auth indépendants. Ils permettent une vraie multi-location et simplifient la gestion de plusieurs équipes ou environnements sur une infrastructure partagée."},
      {id:"8-2",type:"MCQ",text:"Quelle capacité les politiques Sentinel Vault Enterprise fournissent-elles que les politiques ACL ne peuvent pas offrir ?",options:["Évaluation des politiques plus rapide","Logique fine incluant heure du jour, jour de la semaine et conditions MFA","Héritage récursif des politiques entre namespaces","Surcharge mémoire inférieure par token"],correct:1,xp:35,explanation:"Sentinel est un framework de politique-en-tant-que-code permettant une logique comme : 'autoriser l'accès aux secrets uniquement entre 9h-17h en semaine' ou 'exiger MFA pour les opérations d'écriture'. Les politiques ACL sont uniquement chemin + capacité — elles n'ont aucune logique conditionnelle."},
      {id:"8-3",type:"TRUE_FALSE",text:"Les Control Groups dans Vault Enterprise implémentent un principe des 'quatre yeux' nécessitant l'approbation de plusieurs humains autorisés avant qu'un secret soit délivré.",correct:true,xp:30,explanation:"Les Control Groups ajoutent une couche d'approbation humaine au-dessus des politiques standard. Une demande de secret est mise en attente jusqu'à ce que le nombre configuré d'autorisateurs l'approuve explicitement. Critique pour les scénarios de conformité nécessitant un double contrôle sur les opérations sensibles."},
      {id:"8-4",type:"MCQ",text:"Qu'est-ce qu'un 'filtre de chemins' dans la réplication de performance Vault Enterprise ?",options:["Une règle de pare-feu réseau pour le port de réplication","Un moyen de répliquer sélectivement uniquement des chemins de secrets spécifiques vers les clusters secondaires de performance","Un filtre de périphérique d'audit pour la journalisation de conformité","Un limiteur de débit pour les appels API sur les nœuds secondaires"],correct:1,xp:30,explanation:"Les filtres de chemins permettent d'inclure ou d'exclure des chemins de montage spécifiques de la réplication de performance. Utile lorsque différentes régions géographiques ne doivent accéder qu'aux secrets pertinents — réduisant la surface des données et améliorant la conformité."},
    ],
    9:[
      {id:"9-1",type:"MCQ",text:"Où configurez-vous les paramètres de télémétrie Vault pour transmettre les métriques à un agent collecteur ?",options:["sys/telemetry","sys/tools/telemetry","Dans l'interface Vault sous le menu 'Status'","Dans le fichier de configuration Vault (HCL)"],correct:3,xp:25,explanation:"La télémétrie est configurée dans le fichier de configuration HCL du serveur Vault via la stanza telemetry (ex. telemetry { prometheus_retention_time = '30s' }). Elle ne peut pas être configurée via l'API ou l'interface Vault. Les destinations supportées incluent Prometheus, StatsD, DogStatsD et Circonus."},
      {id:"9-2",type:"MCQ",text:"Quelle est la différence principale entre les journaux d'audit Vault et les journaux opérationnels Vault ?",options:["Les journaux d'audit capturent les actions admin ; les journaux opérationnels capturent les actions utilisateur","Les journaux d'audit enregistrent chaque requête et réponse Vault ; les journaux opérationnels enregistrent les événements côté serveur comme le démarrage, les erreurs et les avertissements","Les journaux opérationnels sont stockés chiffrés ; les journaux d'audit sont en clair","Les journaux d'audit ne sont disponibles que dans Vault Enterprise"],correct:1,xp:30,explanation:"Les journaux d'audit sont un enregistrement complet et infalsifiable de chaque requête et réponse API — essentiels pour la conformité. Les journaux opérationnels sont des journaux serveur standard (INFO/WARN/ERROR) sur le fonctionnement interne de Vault : démarrage, chargement de config, état de réplication. Les deux sont critiques mais servent des objectifs différents."},
      {id:"9-3",type:"TERMINAL",text:"Tapez la commande pour activer un périphérique d'audit de type fichier qui écrit dans /var/log/vault_audit.log.",correct:"vault audit enable file file_path=/var/log/vault_audit.log",xp:35,explanation:"vault audit enable crée un périphérique d'audit. Le type 'file' écrit dans un chemin de fichier local. Les autres types sont 'syslog' (démon syslog système) et 'socket' (TCP/UDP). CRITIQUE : si TOUS les périphériques d'audit deviennent indisponibles, Vault arrête de traiter les nouvelles requêtes (comportement fail-closed). Configurez toujours au moins 2 périphériques d'audit en production."},
      {id:"9-4",type:"TRUE_FALSE",text:"Si tous les périphériques d'audit configurés deviennent indisponibles, Vault continue de traiter les requêtes pour assurer la disponibilité du service.",correct:false,xp:25,explanation:"Vault est fail-closed pour la journalisation d'audit. Si tous les périphériques d'audit tombent simultanément, Vault arrête complètement de traiter les nouvelles requêtes plutôt que de permettre des opérations non journalisées. C'est une décision délibérée de sécurité — aucune opération Vault ne doit rester sans audit. Configurez plusieurs périphériques d'audit (ex. file + syslog) pour la résilience."},
    ],
    10:[
      {id:"10-1",type:"MCQ",text:"Quel est le rôle principal de la fonctionnalité auto-auth de Vault Agent ?",options:["Il fait pivoter automatiquement les secrets selon un calendrier","Il s'authentifie automatiquement à Vault et maintient un token valide sans intervention humaine","Il génère automatiquement des politiques basées sur le comportement du workload","Il unseale automatiquement Vault après un redémarrage"],correct:1,xp:30,explanation:"L'auto-auth résout le problème du 'secret zéro' au niveau applicatif : Vault Agent s'authentifie via une méthode configurée (compte de service Kubernetes, AWS IAM, AppRole, etc.) et maintient un token valide et renouvelé dans un fichier token sink. Les applications lisent depuis ce fichier au lieu de s'authentifier directement à Vault — éliminant la gestion des credentials du code applicatif."},
      {id:"10-2",type:"MCQ",text:"Avec ce template Vault Agent : {{ with secret \"secret/data/app\" }} ID: {{ .Data.data.username }} Color: {{ .Data.data.color }} {{ end }} — quelle affirmation n'est PAS valide ?",options:["Le secret dans Vault contient une clé avec le nom username","Le secret dans Vault contient une clé avec le nom color","Le secret dans Vault contient une clé avec le nom ID","Le chemin du secret dans Vault est secret/data/app"],correct:2,xp:35,explanation:"'ID:' dans le template est une étiquette statique dans le fichier de sortie rendu — ce n'est PAS une clé de secret Vault. Les vraies clés Vault accédées sont 'username' (via .Data.data.username) et 'color' (via .Data.data.color). Le préfixe 'ID:' est du texte brut écrit dans le fichier de sortie. Piège classique à l'examen : étiquettes de template ≠ noms de clés Vault."},
      {id:"10-3",type:"MCQ",text:"Quel est le rôle du 'token_sink' dans la configuration de Vault Agent ?",options:["Il supprime automatiquement les tokens expirés","Il écrit le token Vault courant dans un fichier pour que les applications puissent le lire sans s'authentifier directement à Vault","Il envoie les tokens à un cluster Vault distant pour validation","Il fait pivoter le token de l'agent selon un calendrier défini"],correct:1,xp:25,explanation:"Le token sink est un fichier (ou autre destination) où Vault Agent écrit son token valide courant. Les applications lisent ce fichier pour obtenir un token Vault — découplant le mécanisme d'authentification du code applicatif. L'agent gère le renouvellement ; l'application se contente de lire le fichier token. C'est le cœur de la solution secret zéro de Vault Agent."},
      {id:"10-4",type:"TRUE_FALSE",text:"Vault Agent peut se ré-authentifier automatiquement à Vault si son token courant expire ou est révoqué.",correct:true,xp:25,explanation:"L'auto-auth de Vault Agent surveille continuellement le TTL du token et le renouvelle de manière proactive. En cas d'échec du renouvellement (TTL max atteint ou token révoqué), l'agent se ré-authentifie depuis le début via la méthode d'auth configurée. Cela fournit une gestion entièrement automatique du cycle de vie des tokens — sans intervention opérateur."},
    ],
  },
};

// ─── TUTORIALS ────────────────────────────────────────────────────────────────

const TUTORIALS = {
  1:{
    title:"Secret Engines & KV v2", emoji:"🔧",
    intro:"KV v2 is a versioned key-value store. Understanding its path structure and versioning is critical for the exam.",
    steps:[
      {
        title:"Enable KV v2 & Basic Operations",
        body:[
          "Secret engines are enabled at a path. KV v2 is the versioned variant — it tracks every write and lets you roll back.",
          "Enable it at a custom path using the -path flag. The engine type is 'kv-v2'."
        ],
        blocks:[
          {label:"Enable KV v2 at path 'developers'", code:"vault secrets enable -path=developers kv-v2"},
          {label:"Write a secret", code:"vault kv put developers/team/alice password=s3cr3t role=admin"},
          {label:"Read the secret", code:"vault kv get developers/team/alice"},
        ],
        note:{type:"warn", text:"API paths require the 'data/' prefix: /v1/developers/data/team/alice — but CLI commands use the short form without 'data/'."}
      },
      {
        title:"Versioning & Metadata",
        body:[
          "Every write creates a new version. You can pin to a specific version or retrieve the full history via metadata.",
          "Soft-deleting a version hides its data but retains the metadata. Destroying permanently removes the data."
        ],
        blocks:[
          {label:"Get a specific version", code:"vault kv get -version=2 developers/team/alice"},
          {label:"View version history", code:"vault kv metadata get developers/team/alice"},
          {label:"Delete version 1", code:"vault kv delete -versions=1 developers/team/alice"},
          {label:"Destroy version 1 (permanent)", code:"vault kv destroy -versions=1 developers/team/alice"},
        ],
        note:{type:"info", text:"Deleted versions can be undeleted. Destroyed versions cannot. This distinction appears on the exam."}
      },
      {
        title:"Controlling Version Limits",
        body:[
          "By default KV v2 keeps up to 10 versions per key. You can change this per-mount or per-secret.",
          "Setting max_versions to 0 means unlimited — but in practice always cap it to avoid storage bloat."
        ],
        blocks:[
          {label:"Set max versions for the mount", code:"vault write developers/config max_versions=5"},
          {label:"Set max versions per secret", code:"vault kv metadata put -max-versions=3 developers/team/alice"},
          {label:"List all secrets at a path", code:"vault kv list developers/team/"},
        ],
        note:{type:"tip", text:"The exam tests whether you know 'vault write <path>/config' (mount-level) vs 'vault kv metadata put' (key-level) for version limits."}
      },
    ]
  },
  2:{
    title:"Production Hardening", emoji:"🛡️",
    intro:"Production Vault deployments require TLS, audit logging, and key management best practices. Rekey vs Rotate is a classic exam trap.",
    steps:[
      {
        title:"TLS & Listener Hardening",
        body:[
          "All Vault communication must use TLS in production. Configure the listener stanza in your HCL config file.",
          "Disable swap and core dumps at the OS level to prevent secrets from being written to disk."
        ],
        blocks:[
          {label:"Listener with TLS (vault.hcl)", code:'listener "tcp" {\n  address       = "0.0.0.0:8200"\n  tls_cert_file = "/etc/vault/vault.crt"\n  tls_key_file  = "/etc/vault/vault.key"\n}'},
          {label:"Verify TLS certificate", code:"openssl s_client -connect vault.example.com:8200 -showcerts"},
        ],
        note:{type:"warn", text:"Never set tls_disable=1 in production. The exam may present configs with this flag — always flag it as insecure."}
      },
      {
        title:"Unseal Key Management — Rekey vs Rotate",
        body:[
          "Two separate operations are commonly confused on the exam: rekey and rotate.",
          "• vault operator rekey — generates NEW unseal keys (and optionally a new root key). Use this when key holders change.",
          "• vault operator rotate — rotates the INTERNAL encryption key used for storage. Transparent to operators — no new unseal keys."
        ],
        blocks:[
          {label:"Rekey: generate 5 new shares, threshold 3", code:"vault operator rekey -init -key-shares=5 -key-threshold=3"},
          {label:"Provide an existing unseal key", code:"vault operator rekey <unseal-key>"},
          {label:"Rotate the storage encryption key", code:"vault operator rotate"},
        ],
        note:{type:"info", text:"Rekey = new unseal keys handed to new trustees. Rotate = new AES key for storage, no human action needed after."}
      },
      {
        title:"Audit Devices & Audit Logging",
        body:[
          "Enable at least two audit devices in production. If ALL audit devices fail, Vault fails closed (stops serving requests).",
          "File audit is the simplest. Syslog and socket are alternatives for centralized log management."
        ],
        blocks:[
          {label:"Enable file audit log", code:"vault audit enable file file_path=/var/log/vault_audit.log"},
          {label:"Enable syslog audit", code:"vault audit enable syslog"},
          {label:"List audit devices", code:"vault audit list"},
        ],
        note:{type:"warn", text:"Vault FAILS CLOSED if all audit devices are unreachable. This is intentional — it prevents silent audit gaps."}
      },
    ]
  },
  3:{
    title:"Security Model & Seal/Unseal", emoji:"🔒",
    intro:"The seal/unseal ceremony, Shamir's Secret Sharing, and HSM integration are heavily tested. Know each unseal method's trade-offs.",
    steps:[
      {
        title:"Shamir's Secret Sharing & Init",
        body:[
          "vault operator init splits the master key into N shares with a threshold T. You need T shares to reconstruct the key and unseal Vault.",
          "The root token from init should be used once, then revoked. Store unseal keys in separate secure locations."
        ],
        blocks:[
          {label:"Initialize with 5 shares, threshold 3", code:"vault operator init -key-shares=5 -key-threshold=3"},
          {label:"Unseal with one share (repeat T times)", code:"vault operator unseal <unseal-key>"},
          {label:"Check seal status", code:"vault status"},
        ],
        note:{type:"info", text:"The root token created at init should be revoked after initial setup. Use 'vault token revoke <root-token>' once all auth methods and policies are configured."}
      },
      {
        title:"Auto Unseal — HSM & Cloud KMS",
        body:[
          "Auto unseal delegates the unseal key protection to an external KMS (AWS KMS, Azure Key Vault, GCP CKMS, HSM via PKCS#11).",
          "Configured in the SEAL STANZA of the HCL config file — not via the API or vault operator init flags."
        ],
        blocks:[
          {label:"AWS KMS seal stanza (vault.hcl)", code:'seal "awskms" {\n  region     = "us-east-1"\n  kms_key_id = "alias/vault-unseal"\n}'},
          {label:"Migrate from Shamir to Auto Unseal", code:"vault operator unseal -migrate"},
        ],
        note:{type:"warn", text:"Auto unseal is configured in HCL — not via vault operator commands. The exam tests this distinction."}
      },
      {
        title:"Seal Wrap & Entropy Augmentation",
        body:[
          "Seal Wrap uses the HSM/KMS to double-encrypt sensitive values (tokens, policies). Requires an HSM with PKCS#11 support.",
          "Entropy Augmentation feeds HSM-generated random bytes into Vault's key generation for higher-assurance environments."
        ],
        blocks:[
          {label:"Enable seal wrap on a mount", code:"vault secrets enable -seal-wrap -path=secret kv-v2"},
          {label:"Verify seal wrap status", code:"vault read sys/mounts/secret"},
        ],
        note:{type:"tip", text:"Seal Wrap uses AES-256-GCM (symmetric encryption via PKCS#11). The exam sometimes says 'asymmetric' — that is wrong."}
      },
    ]
  },
  4:{
    title:"Tokens & Policies", emoji:"🎫",
    intro:"Policies use HCL path globs and capability lists. The deny capability always wins. Know the default policy, root policy, and token hierarchy.",
    steps:[
      {
        title:"Policy Syntax & Capabilities",
        body:[
          "Policies are HCL files with path blocks and a capabilities list. Valid capabilities: create, read, update, delete, list, sudo, deny.",
          "The 'deny' capability overrides everything else — if any policy attached to a token denies a path, access is denied."
        ],
        blocks:[
          {label:"Example policy HCL", code:'path "secret/data/app/*" {\n  capabilities = ["create", "read", "update"]\n}\npath "secret/data/app/admin" {\n  capabilities = ["deny"]\n}'},
          {label:"Write a policy", code:"vault policy write app-policy app-policy.hcl"},
          {label:"Read a policy", code:"vault policy read app-policy"},
        ],
        note:{type:"warn", text:"deny always wins. Even if five policies grant access, one deny blocks it. This is the #1 policy exam trap."}
      },
      {
        title:"Token Types & Hierarchy",
        body:[
          "Service tokens are renewable and tracked in storage. Batch tokens are lightweight, encrypted blobs — not stored, not renewable.",
          "Tokens have a parent. When a parent is revoked, all child tokens are also revoked (token tree). Orphan tokens have no parent."
        ],
        blocks:[
          {label:"Create a service token with a policy", code:"vault token create -policy=app-policy -ttl=1h"},
          {label:"Create a batch token", code:"vault token create -type=batch -policy=app-policy -ttl=1h"},
          {label:"Create an orphan token", code:"vault token create -orphan -policy=app-policy"},
          {label:"Look up a token", code:"vault token lookup <token>"},
        ],
        note:{type:"info", text:"Batch tokens cannot be renewed, cannot have children, and cannot use the cubbyhole secret engine. Great for high-throughput short-lived workloads."}
      },
      {
        title:"Default Policy & Root Policy",
        body:[
          "Every token (except root) automatically gets the 'default' policy attached. The default policy grants access to sys/tools, auth/token/renew-self, and the cubbyhole.",
          "The 'root' policy has unlimited access. Only root tokens or tokens with sudo on sys/policies can manage root-level paths."
        ],
        blocks:[
          {label:"View the default policy", code:"vault policy read default"},
          {label:"List all policies", code:"vault policy list"},
          {label:"Create token with no default policy", code:"vault token create -no-default-policy -policy=app-policy"},
        ],
        note:{type:"tip", text:"The default policy does NOT grant access to arbitrary sys/ paths. It only covers specific self-service paths like renew-self and cubbyhole."}
      },
    ]
  },
  5:{
    title:"High Availability & Replication", emoji:"🏗️",
    intro:"Vault HA uses an active/standby model. Integrated Storage (Raft) is the recommended backend. Performance standbys and DR replication have specific behaviors.",
    steps:[
      {
        title:"Raft Integrated Storage",
        body:[
          "Integrated Storage (Raft) is Vault's built-in HA backend. No external storage dependency like Consul.",
          "Requires an odd number of nodes (3 or 5) for quorum. One node is active; the others are standbys."
        ],
        blocks:[
          {label:"Raft storage stanza (vault.hcl)", code:'storage "raft" {\n  path    = "/opt/vault/data"\n  node_id = "vault-node-1"\n}'},
          {label:"Join a node to the cluster", code:"vault operator raft join https://vault-node-1:8200"},
          {label:"List Raft peers", code:"vault operator raft list-peers"},
        ],
        note:{type:"info", text:"Raft requires the cluster_addr to be set so nodes can communicate. This is separate from api_addr (client-facing)."}
      },
      {
        title:"Performance Standbys",
        body:[
          "Performance standby nodes (Vault Enterprise) serve read requests locally without forwarding to the active node.",
          "Write requests are automatically forwarded to the active node. This scales read-heavy workloads horizontally."
        ],
        blocks:[
          {label:"Check if a node is a performance standby", code:"vault status | grep 'Performance Standby'"},
          {label:"Read from a performance standby (normal client call)", code:"vault kv get secret/data/myapp"},
        ],
        note:{type:"warn", text:"Performance standbys handle READS locally. WRITES are forwarded to the active node. The exam may try to trick you with 'writes are served locally' — that is false."}
      },
      {
        title:"DR Replication",
        body:[
          "Disaster Recovery (DR) replication replicates the full cluster state to a secondary cluster for failover.",
          "DR secondary nodes are COLD STANDBY — they do not serve client traffic until promoted. Promotion wipes the secondary's existing data."
        ],
        blocks:[
          {label:"Enable DR primary", code:"vault write -f sys/replication/dr/primary/enable"},
          {label:"Generate DR secondary token", code:"vault write sys/replication/dr/primary/secondary-token id=dr-secondary"},
          {label:"Enable DR secondary", code:"vault write sys/replication/dr/secondary/enable token=<secondary-token>"},
          {label:"Promote DR secondary", code:"vault write -f sys/replication/dr/secondary/promote"},
        ],
        note:{type:"warn", text:"Activating a DR secondary WIPES ALL DATA on that cluster and replaces it with the primary's state. This is by design — but the exam tests whether you know this."}
      },
    ]
  },
  6:{
    title:"Dynamic Secrets & Auth Methods", emoji:"⚡",
    intro:"Dynamic secrets are generated on demand and automatically expire. Auth methods let workloads authenticate without long-lived credentials.",
    steps:[
      {
        title:"Database Dynamic Secrets",
        body:[
          "The database secrets engine generates short-lived database credentials on demand. When the lease expires, Vault revokes the credentials.",
          "Configure a connection, then define roles with SQL creation statements."
        ],
        blocks:[
          {label:"Enable database engine", code:"vault secrets enable database"},
          {label:"Configure PostgreSQL connection", code:'vault write database/config/my-postgres\n  plugin_name=postgresql-database-plugin\n  connection_url="postgresql://{{username}}:{{password}}@localhost/mydb"\n  allowed_roles="my-role"\n  username="vault"\n  password="vault-password"'},
          {label:"Define a role", code:'vault write database/roles/my-role\n  db_name=my-postgres\n  creation_statements="CREATE ROLE \\"{{name}}\\" WITH LOGIN PASSWORD \'{{password}}\' VALID UNTIL \'{{expiration}}\';"\n  default_ttl="1h"\n  max_ttl="24h"'},
          {label:"Generate credentials", code:"vault read database/creds/my-role"},
        ],
        note:{type:"info", text:"Dynamic credentials are tied to a lease. When the lease expires (or is revoked), Vault deletes the DB user. The application must handle credential rotation."}
      },
      {
        title:"AppRole Auth Method",
        body:[
          "AppRole is the standard auth method for machine/app workloads. The app authenticates with a RoleID (non-secret, embeddable) and a SecretID (secret, short-lived).",
          "This solves the 'secret zero' problem — the SecretID is injected at runtime by a trusted orchestrator."
        ],
        blocks:[
          {label:"Enable AppRole", code:"vault auth enable approle"},
          {label:"Create a role", code:"vault write auth/approle/role/my-app token_policies=app-policy token_ttl=1h"},
          {label:"Get the RoleID", code:"vault read auth/approle/role/my-app/role-id"},
          {label:"Generate a SecretID", code:"vault write -f auth/approle/role/my-app/secret-id"},
          {label:"Login with AppRole", code:'vault write auth/approle/login\n  role_id=<role-id>\n  secret_id=<secret-id>'},
        ],
        note:{type:"tip", text:"RoleID is like a username — not secret, can be baked into an image. SecretID is like a password — short TTL, single use, injected at deploy time."}
      },
      {
        title:"Kubernetes Auth Method",
        body:[
          "The Kubernetes auth method lets pods authenticate using their service account JWT. No long-lived credentials needed in the pod.",
          "Vault validates the JWT against the Kubernetes API server."
        ],
        blocks:[
          {label:"Enable Kubernetes auth", code:"vault auth enable kubernetes"},
          {label:"Configure the auth method", code:'vault write auth/kubernetes/config\n  kubernetes_host=https://kubernetes.default.svc\n  kubernetes_ca_cert=@/var/run/secrets/kubernetes.io/serviceaccount/ca.crt'},
          {label:"Create a role binding", code:'vault write auth/kubernetes/role/my-app\n  bound_service_account_names=my-sa\n  bound_service_account_namespaces=default\n  token_policies=app-policy\n  ttl=1h'},
        ],
        note:{type:"info", text:"The pod's service account JWT is the credential. Vault verifies it with Kubernetes — no SecretID needed. This is the recommended approach for Kubernetes workloads."}
      },
    ]
  },
  7:{
    title:"Namespaces & Sentinel", emoji:"🏢",
    intro:"Namespaces provide multi-tenancy with isolated auth methods, policies, and secret engines. Sentinel enables fine-grained policy enforcement with logic.",
    steps:[
      {
        title:"Namespace Isolation",
        body:[
          "Namespaces (Vault Enterprise) create isolated Vault environments within a single cluster. Each namespace has its own auth methods, policies, and secret engines.",
          "A token from namespace A cannot access namespace B resources unless explicitly granted."
        ],
        blocks:[
          {label:"Create a namespace", code:"vault namespace create team-alpha"},
          {label:"List namespaces", code:"vault namespace list"},
          {label:"Operate within a namespace", code:"VAULT_NAMESPACE=team-alpha vault kv get secret/myapp"},
          {label:"Or use the -namespace flag", code:"vault kv get -namespace=team-alpha secret/myapp"},
        ],
        note:{type:"info", text:"The root namespace cannot be deleted. Child namespaces inherit the root CA but have fully isolated auth, policies, and secrets."}
      },
      {
        title:"Vault Sentinel Policies",
        body:[
          "Sentinel extends Vault's policy language with conditional logic. You can enforce policies based on time, MFA, request metadata, and more.",
          "Two policy types: EGP (Endpoint Governing Policies) apply to specific API paths. RGPs (Role Governing Policies) apply to tokens."
        ],
        blocks:[
          {label:"Example Sentinel EGP (business-hours only)", code:'import "time"\n\nmain = rule {\n  time.now.weekday not in [0, 6] and\n  time.now.hour >= 9 and time.now.hour < 17\n}'},
          {label:"Write an EGP policy", code:'vault write sys/policies/egp/business-hours\n  policy="$(base64 business-hours.sentinel)"\n  paths="secret/*"\n  enforcement_level="hard-mandatory"'},
        ],
        note:{type:"tip", text:"EGP enforcement levels: advisory (log only), soft-mandatory (can override with sudo), hard-mandatory (no override). The exam tests all three."}
      },
      {
        title:"MFA with Sentinel",
        body:[
          "Vault Enterprise supports TOTP and Okta MFA enforcement via Sentinel policies.",
          "MFA can be required for specific paths or operations, enforced at the policy layer."
        ],
        blocks:[
          {label:"Enable TOTP MFA", code:"vault write sys/mfa/method/totp/my-mfa issuer=VaultQuest period=30 key_size=20 algorithm=SHA256"},
          {label:"Enforce MFA via Sentinel", code:'import "mfa"\n\nmain = rule {\n  mfa.methods.my-mfa.valid\n}'},
        ],
        note:{type:"info", text:"MFA enforcement is separate from auth method MFA. Sentinel MFA checks happen after authentication, at the authorization layer."}
      },
    ]
  },
  8:{
    title:"HSM & Auto Unseal Deep Dive", emoji:"🔑",
    intro:"HSM integration (PKCS#11) and cloud KMS auto-unseal are key exam topics. Know what each protects and how seal wrap works.",
    steps:[
      {
        title:"PKCS#11 HSM Integration",
        body:[
          "Vault can use a Hardware Security Module via PKCS#11 to protect the root key. The HSM never exports the key material — it performs the encrypt/decrypt operations internally.",
          "Configured in the seal stanza of vault.hcl."
        ],
        blocks:[
          {label:"PKCS#11 seal stanza (vault.hcl)", code:'seal "pkcs11" {\n  lib            = "/usr/lib/softhsm/libsofthsm2.so"\n  slot           = "0"\n  pin            = "1234"\n  key_label      = "vault-hsm-key"\n  hmac_key_label = "vault-hsm-hmac-key"\n}'},
        ],
        note:{type:"warn", text:"The HSM key is used for AES-256-GCM (symmetric) encryption — NOT RSA/asymmetric. The exam may state otherwise — that is wrong."}
      },
      {
        title:"Cloud KMS Auto Unseal",
        body:[
          "Cloud KMS (AWS KMS, Azure Key Vault, GCP CKMS) wraps the Vault root key. On startup, Vault calls the KMS to unwrap the key automatically.",
          "This eliminates the manual unseal ceremony. The security boundary shifts to the KMS key policy."
        ],
        blocks:[
          {label:"GCP CKMS seal stanza", code:'seal "gcpckms" {\n  project    = "my-gcp-project"\n  region     = "global"\n  key_ring   = "vault-keyring"\n  crypto_key = "vault-key"\n}'},
          {label:"Azure Key Vault seal stanza", code:'seal "azurekeyvault" {\n  tenant_id      = "00000000-0000-0000-0000-000000000000"\n  client_id      = "00000000-0000-0000-0000-000000000000"\n  client_secret  = "xxxx"\n  vault_name     = "my-azure-vault"\n  key_name       = "vault-unseal-key"\n}'},
        ],
        note:{type:"info", text:"Auto unseal configuration is in HCL only. You cannot configure auto unseal via the Vault API or CLI after the server starts."}
      },
      {
        title:"Seal Wrap & Recovery Keys",
        body:[
          "With auto unseal, init generates recovery keys (not unseal keys). These are used for manual recovery if the KMS is unavailable.",
          "Seal wrap double-encrypts sensitive values (policies, tokens) using the seal mechanism."
        ],
        blocks:[
          {label:"Init with recovery keys (auto unseal active)", code:"vault operator init -recovery-shares=5 -recovery-threshold=3"},
          {label:"Enable seal wrap on a mount", code:"vault secrets enable -seal-wrap -path=sensitive kv-v2"},
          {label:"Generate a new root token using recovery keys", code:"vault operator generate-root -init"},
        ],
        note:{type:"tip", text:"With auto unseal: 'unseal keys' become 'recovery keys'. The init flags change from -key-shares/-key-threshold to -recovery-shares/-recovery-threshold."}
      },
    ]
  },
  9:{
    title:"Monitoring & Audit", emoji:"📊",
    intro:"Vault telemetry, audit logging, and operational logging are distinct systems. Know where each is configured and what each captures.",
    steps:[
      {
        title:"Telemetry Configuration",
        body:[
          "Vault telemetry exposes metrics (counters, gauges, timers) to monitoring systems like Prometheus, Datadog, or statsd.",
          "Telemetry is configured in the telemetry STANZA of the HCL config file — not via the API or CLI commands."
        ],
        blocks:[
          {label:"Telemetry stanza (vault.hcl)", code:'telemetry {\n  prometheus_retention_time = "30s"\n  disable_hostname          = true\n}'},
          {label:"Scrape metrics (Prometheus format)", code:"curl http://localhost:8200/v1/sys/metrics?format=prometheus"},
        ],
        note:{type:"warn", text:"Telemetry is in HCL config — NOT configurable via vault write or the API. The exam specifically tests this distinction."}
      },
      {
        title:"Audit Devices",
        body:[
          "Audit devices record every request and response Vault processes. Sensitive values are HMAC-hashed in the log.",
          "If ALL audit devices fail, Vault FAILS CLOSED — it stops serving requests. This is intentional security behavior."
        ],
        blocks:[
          {label:"Enable file audit", code:"vault audit enable file file_path=/var/log/vault_audit.log"},
          {label:"Enable syslog audit", code:"vault audit enable syslog"},
          {label:"Enable socket audit", code:"vault audit enable socket address=127.0.0.1:9090 socket_type=tcp"},
          {label:"List audit devices", code:"vault audit list -detailed"},
        ],
        note:{type:"info", text:"Audit logs record HMAC-hashed tokens — not plaintext. You can verify a token by HMACing it with the audit salt: 'vault audit hash <device-path> <token>'."}
      },
      {
        title:"Operational Logs vs Audit Logs",
        body:[
          "Audit logs = every request/response, security-focused, HMAC-protected. Configured via vault audit enable.",
          "Operational logs = server startup, errors, backend communication. Configured via the log_level and log_file HCL settings — NOT vault audit."
        ],
        blocks:[
          {label:"Set log level (vault.hcl)", code:'log_level = "info"\nlog_file  = "/var/log/vault/vault.log"'},
          {label:"Set log level at runtime (no restart)", code:"vault server -log-level=debug"},
        ],
        note:{type:"tip", text:"Audit logs ≠ operational logs. Audit logs are about WHAT requests were made. Operational logs are about HOW Vault is running. The exam tests both."}
      },
    ]
  },
  10:{
    title:"Vault Agent", emoji:"🤖",
    intro:"Vault Agent solves the 'secret zero' problem at runtime using auto-auth. It can cache tokens and render secrets into files via templates.",
    steps:[
      {
        title:"Auto-Auth & Token Sink",
        body:[
          "Vault Agent authenticates to Vault on behalf of the application using a configured auth method (AppRole, Kubernetes, AWS, etc.).",
          "The resulting token is written to a sink file. The application reads the token from the file — it never needs to authenticate itself."
        ],
        blocks:[
          {label:"Vault Agent config (agent.hcl)", code:'vault {\n  address = "https://vault.example.com:8200"\n}\nauto_auth {\n  method "approle" {\n    config = {\n      role_id_file_path   = "/etc/vault/role-id"\n      secret_id_file_path = "/etc/vault/secret-id"\n    }\n  }\n  sink "file" {\n    config = {\n      path = "/tmp/vault-token"\n    }\n  }\n}'},
          {label:"Start the agent", code:"vault agent -config=agent.hcl"},
        ],
        note:{type:"info", text:"The token sink file is written by the agent and read by the app. The app uses VAULT_TOKEN pointing to this file or reads it directly."}
      },
      {
        title:"Template Rendering",
        body:[
          "Vault Agent templates use Consul Template syntax to render secrets from Vault into files. The agent re-renders the file whenever the secret changes or the lease renews.",
          "Templates use Go text/template syntax with Consul Template functions like 'secret' and 'with'."
        ],
        blocks:[
          {label:"Template stanza in agent.hcl", code:'template {\n  source      = "/etc/vault/db-creds.tpl"\n  destination = "/app/config/db-creds.env"\n  command     = "systemctl restart myapp"\n}'},
          {label:"Template file (db-creds.tpl)", code:'{{- with secret "database/creds/my-role" -}}\nDB_USER={{ .Data.username }}\nDB_PASS={{ .Data.password }}\n{{- end -}}'},
        ],
        note:{type:"warn", text:"The template 'ID:' field in agent.hcl is a LABEL for the template stanza — it is NOT a Vault path or secret key. This is the exact trick from the exam PDF question."}
      },
      {
        title:"Agent Caching & Re-Authentication",
        body:[
          "Vault Agent can act as a local caching proxy. Applications send Vault API requests to the agent, which caches responses and forwards misses to Vault.",
          "If the token expires, the agent automatically re-authenticates and updates the sink file — the application does not need to handle this."
        ],
        blocks:[
          {label:"Enable caching in agent.hcl", code:'cache {\n  use_auto_auth_token = true\n}\nlistener "tcp" {\n  address     = "127.0.0.1:8007"\n  tls_disable = true\n}'},
          {label:"App uses agent as Vault proxy", code:"export VAULT_ADDR=http://127.0.0.1:8007"},
        ],
        note:{type:"tip", text:"With caching enabled, the agent acts as a local Vault proxy. The app points VAULT_ADDR to the agent — it gets transparent caching and auto token renewal."}
      },
    ]
  },
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function loadState(uid)  { try { const r=localStorage.getItem(STORAGE_KEY_FOR(uid)); if(r) return{...defaultState,...JSON.parse(r)}; } catch{} return{...defaultState}; }
function saveState(s,uid){ try { localStorage.setItem(STORAGE_KEY_FOR(uid),JSON.stringify(s)); } catch{} }
function loadLang()      { return localStorage.getItem(LANG_KEY)||'en'; }

const getLevel       = xp  => Math.floor(xp/500)+1;
const getLevelAvatar = l   => l>=12?"🔮":l>=8?"🧙":l>=5?"⚔️":l>=3?"🥷":"🔰";
const getStreakMult   = s   => s>=5?2.0:s>=3?1.5:1.0;
const getChapterProg  = (id,aq,lang) => { const qs=QUESTIONS[lang][id]; return qs.filter(q=>aq[q.id]!==undefined).length/qs.length; };
const isLocked        = (id,aq,lang) => id===1?false:getChapterProg(id-1,aq,lang)<0.6;
const shuffle         = arr => [...arr].sort(()=>Math.random()-0.5);

function triggerFireworks(ref) {
  if(!ref?.current) return;
  const emojis=["🎆","✨","⭐","💥","🎇","🌟","💫","🎉"];
  const rect=ref.current.getBoundingClientRect();
  const cx=rect.left+rect.width/2, cy=rect.top+rect.height/2;
  for(let i=0;i<20;i++){
    const el=document.createElement('div');
    el.textContent=emojis[Math.floor(Math.random()*emojis.length)];
    el.style.cssText=`position:fixed;left:${cx}px;top:${cy}px;font-size:${16+Math.random()*16}px;pointer-events:none;z-index:9999;transform:translate(-50%,-50%);`;
    document.body.appendChild(el);
    const dx=(Math.random()-.5)*400, dy=-Math.random()*350+50, delay=Math.random()*200;
    setTimeout(()=>{ el.style.transition='transform 1.2s ease-out,opacity 1.2s ease-out'; el.style.transform=`translate(calc(-50% + ${dx}px),calc(-50% + ${dy}px))`; el.style.opacity='0'; },delay);
    setTimeout(()=>{ if(document.body.contains(el)) document.body.removeChild(el); },delay+1400);
  }
}

// ─── SVG LOGOS ────────────────────────────────────────────────────────────────

const GoogleLogo = () => (
  <svg width="18" height="18" viewBox="0 0 18 18" style={{flexShrink:0}}>
    <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908C16.658 14.013 17.64 11.706 17.64 9.2z"/>
    <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z"/>
    <path fill="#FBBC05" d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z"/>
    <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.96L3.964 7.292C4.672 5.163 6.656 3.58 9 3.58z"/>
  </svg>
);

const GithubLogo = () => (
  <svg width="18" height="18" viewBox="0 0 16 16" style={{flexShrink:0}}>
    <path fill="white" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"/>
  </svg>
);

// ─── AUTH SCREEN ──────────────────────────────────────────────────────────────

function AuthScreen({ t, lang, setLang, onGuest }) {
  const [loading, setLoading] = useState(null); // 'google' | 'github' | null
  const [error, setError]     = useState('');

  async function handleSignIn(provider, name) {
    if(!FIREBASE_CONFIGURED) return;
    setLoading(name); setError('');
    try {
      await signInWithPopup(auth, provider);
    } catch(e) {
      if(e.code !== 'auth/popup-closed-by-user') setError(t.authError);
      setLoading(null);
    }
  }

  return (
    <div style={{background:'var(--vault-dark)',minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:20}}>
      <style>{CSS_VARS}</style>

      {/* Lang picker top-right */}
      <div style={{position:'fixed',top:16,right:16}}>
        <LangPicker lang={lang} setLang={setLang}/>
      </div>

      {/* Card */}
      <div style={{width:'100%',maxWidth:420,display:'flex',flexDirection:'column',alignItems:'center',gap:0}}>

        {/* Logo */}
        <div className="auth-float" style={{fontSize:72,marginBottom:8,filter:'drop-shadow(0 0 24px rgba(0,212,164,.5))'}}>🔐</div>
        <div style={{fontFamily:'JetBrains Mono,monospace',fontWeight:900,fontSize:28,color:'#00D4A4',letterSpacing:-1,marginBottom:6}}>VaultQuest</div>
        <p style={{fontSize:13,color:'#6b7280',textAlign:'center',marginBottom:32,lineHeight:'1.6'}}>{t.authSubtitle}</p>

        {/* Main card */}
        <div style={{width:'100%',background:'rgba(17,24,39,.9)',border:'1px solid #1f2937',borderRadius:20,padding:'28px 24px',backdropFilter:'blur(10px)',boxShadow:'0 0 60px rgba(0,212,164,.06)'}}>

          {/* Firebase not configured warning */}
          {!FIREBASE_CONFIGURED && (
            <div style={{padding:'12px 14px',borderRadius:10,background:'rgba(234,179,8,.1)',border:'1px solid rgba(234,179,8,.3)',marginBottom:20,display:'flex',gap:10,alignItems:'flex-start'}}>
              <AlertCircle size={16} color="#eab308" style={{flexShrink:0,marginTop:1}}/>
              <div>
                <div style={{fontSize:12,color:'#eab308',fontWeight:600,marginBottom:3}}>{t.configWarning}</div>
                <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer"
                  style={{fontSize:11,color:'#6b7280',textDecoration:'underline'}}>{t.configSetup} →</a>
              </div>
            </div>
          )}

          {/* Google */}
          <button onClick={()=>handleSignIn(googleProvider,'google')} disabled={!FIREBASE_CONFIGURED||loading!==null}
            style={{width:'100%',padding:'13px 16px',borderRadius:12,border:'1px solid #e5e7eb',background:'white',color:'#111827',fontWeight:600,fontSize:14,cursor:!FIREBASE_CONFIGURED?'not-allowed':'pointer',display:'flex',alignItems:'center',gap:12,marginBottom:12,transition:'all .2s',opacity:!FIREBASE_CONFIGURED?.5:1}}
            onMouseEnter={e=>{ if(FIREBASE_CONFIGURED&&!loading) e.currentTarget.style.boxShadow='0 0 0 2px rgba(66,133,244,.5)'; }}
            onMouseLeave={e=>{ e.currentTarget.style.boxShadow='none'; }}>
            {loading==='google'
              ? <div style={{width:18,height:18,border:'2px solid #e5e7eb',borderTopColor:'#4285F4',borderRadius:'50%',animation:'spin .8s linear infinite',flexShrink:0}}/>
              : <GoogleLogo/>}
            <span style={{flex:1,textAlign:'center'}}>{t.signInGoogle}</span>
          </button>

          {/* GitHub */}
          <button onClick={()=>handleSignIn(githubProvider,'github')} disabled={!FIREBASE_CONFIGURED||loading!==null}
            style={{width:'100%',padding:'13px 16px',borderRadius:12,border:'1px solid #374151',background:'#1f2937',color:'white',fontWeight:600,fontSize:14,cursor:!FIREBASE_CONFIGURED?'not-allowed':'pointer',display:'flex',alignItems:'center',gap:12,marginBottom:20,transition:'all .2s',opacity:!FIREBASE_CONFIGURED?.5:1}}
            onMouseEnter={e=>{ if(FIREBASE_CONFIGURED&&!loading) e.currentTarget.style.borderColor='#6b7280'; }}
            onMouseLeave={e=>{ e.currentTarget.style.borderColor='#374151'; }}>
            {loading==='github'
              ? <div style={{width:18,height:18,border:'2px solid #374151',borderTopColor:'white',borderRadius:'50%',animation:'spin .8s linear infinite',flexShrink:0}}/>
              : <GithubLogo/>}
            <span style={{flex:1,textAlign:'center'}}>{t.signInGithub}</span>
          </button>

          {/* Divider */}
          <div style={{display:'flex',alignItems:'center',gap:12,marginBottom:18}}>
            <div style={{flex:1,height:1,background:'#1f2937'}}/>
            <span style={{fontSize:11,color:'#4b5563'}}>or</span>
            <div style={{flex:1,height:1,background:'#1f2937'}}/>
          </div>

          {/* Guest */}
          <button onClick={onGuest}
            style={{width:'100%',padding:'11px 16px',borderRadius:12,border:'1px solid rgba(0,212,164,.3)',background:'transparent',color:'#00D4A4',fontWeight:600,fontSize:13,cursor:'pointer',transition:'all .2s'}}
            onMouseEnter={e=>{ e.currentTarget.style.background='rgba(0,212,164,.08)'; }}
            onMouseLeave={e=>{ e.currentTarget.style.background='transparent'; }}>
            {t.guestMode}
          </button>
          <p style={{textAlign:'center',fontSize:11,color:'#4b5563',marginTop:8}}>{t.guestNote}</p>

          {/* Error */}
          {error&&<div style={{marginTop:14,padding:'10px 12px',borderRadius:9,background:'rgba(239,68,68,.1)',border:'1px solid rgba(239,68,68,.3)',color:'#ef4444',fontSize:12,textAlign:'center'}}>{error}</div>}
        </div>

        <p style={{marginTop:18,fontSize:11,color:'#374151',textAlign:'center'}}>{t.subtitle}</p>
      </div>

      <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
    </div>
  );
}

// ─── SMALL COMPONENTS ─────────────────────────────────────────────────────────

function CircularProgress({ pct, size=48 }) {
  const r=(size-8)/2, circ=2*Math.PI*r, dash=circ*Math.min(pct,1);
  return (
    <svg width={size} height={size} style={{transform:'rotate(-90deg)'}}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#1f2937" strokeWidth="4"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#00D4A4" strokeWidth="4"
        strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" style={{transition:'stroke-dasharray .5s ease'}}/>
    </svg>
  );
}

function Stars({ n }) {
  return <div style={{display:'flex',gap:2}}>{Array.from({length:5}).map((_,i)=>(
    <Star key={i} size={11} style={{fill:i<n?'#FFD700':'none',color:i<n?'#FFD700':'#374151'}}/>
  ))}</div>;
}

function XPBar({ xp, t }) {
  const lvl=getLevel(xp), inLvl=xp-(lvl-1)*500, pct=Math.min((inLvl/500)*100,100);
  return (
    <div>
      <div style={{display:'flex',justifyContent:'space-between',fontSize:11,color:'#6b7280',marginBottom:4}}>
        <span>{t.level} {lvl}</span><span>{inLvl}/500 {t.xpTo}{lvl+1}</span>
      </div>
      <div style={{height:8,background:'#1f2937',borderRadius:99,overflow:'hidden'}}>
        <div style={{height:'100%',width:`${pct}%`,background:'linear-gradient(90deg,#00D4A4,#7C3AED)',borderRadius:99,transition:'width .5s ease'}}/>
      </div>
    </div>
  );
}

function TypeBadge({ type, t }) {
  const map={MCQ:{bg:'rgba(124,58,237,.2)',color:'#a78bfa',label:t.typeMCQ},TERMINAL:{bg:'rgba(0,212,164,.2)',color:'#00D4A4',label:t.typeTERMINAL},TRUE_FALSE:{bg:'rgba(255,215,0,.2)',color:'#FFD700',label:t.typeTF}};
  const s=map[type];
  return <span style={{fontSize:11,padding:'2px 8px',borderRadius:99,background:s.bg,color:s.color,fontFamily:'JetBrains Mono,monospace',fontWeight:600}}>{s.label}</span>;
}

function LangPicker({ lang, setLang }) {
  return (
    <div style={{display:'flex',gap:4,padding:3,borderRadius:99,background:'rgba(31,41,55,.8)',border:'1px solid #374151'}}>
      {LANGUAGES.map(l=>(
        <button key={l.code} onClick={()=>setLang(l.code)} title={l.label}
          style={{padding:'2px 7px',borderRadius:99,fontSize:15,cursor:'pointer',border:'none',transition:'all .2s',background:lang===l.code?'rgba(0,212,164,.25)':'transparent',boxShadow:lang===l.code?'0 0 0 1px #00D4A4':'none',outline:'none',lineHeight:1}}>
          {l.flag}
        </button>
      ))}
    </div>
  );
}

// ─── HEADER ───────────────────────────────────────────────────────────────────

function Header({ gs, onProfile, profileActive=false, lang, setLang, t, user, onSignOut }) {
  const lvl=getLevel(gs.totalXP), inLvl=gs.totalXP-(lvl-1)*500, pct=Math.min((inLvl/500)*100,100);
  const isGuest=!user||user.isGuest;
  return (
    <header style={{background:'rgba(10,14,26,.95)',borderBottom:'1px solid #1f2937',backdropFilter:'blur(10px)',position:'sticky',top:0,zIndex:40,padding:'10px 20px'}}>
      <div style={{maxWidth:1100,margin:'0 auto',display:'flex',alignItems:'center',gap:12}}>
        <span style={{fontFamily:'JetBrains Mono,monospace',fontWeight:900,fontSize:18,color:'#00D4A4',whiteSpace:'nowrap'}}>🔐 VaultQuest</span>
        <div style={{flex:1,display:'flex',flexDirection:'column',gap:3,padding:'0 12px'}}>
          <div style={{display:'flex',justifyContent:'space-between',fontSize:10,color:'#6b7280'}}>
            <span>{t.level} {lvl}</span><span>{inLvl} / 500 XP</span>
          </div>
          <div style={{height:5,background:'#1f2937',borderRadius:99,overflow:'hidden'}}>
            <div style={{height:'100%',width:`${pct}%`,background:'linear-gradient(90deg,#00D4A4,#7C3AED)',transition:'width .5s ease'}}/>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:8,flexShrink:0}}>
          {gs.streak>=2&&<span style={{padding:'2px 9px',borderRadius:99,fontSize:12,fontWeight:700,background:gs.streak>=5?'rgba(255,215,0,.2)':'rgba(249,115,22,.2)',color:gs.streak>=5?'#FFD700':'#fb923c'}}>🔥 {gs.streak}</span>}
          <span style={{padding:'2px 9px',borderRadius:99,fontSize:11,fontWeight:700,background:'rgba(124,58,237,.3)',color:'#a78bfa',border:'1px solid rgba(124,58,237,.4)'}}>Lv.{lvl}</span>
          <LangPicker lang={lang} setLang={setLang}/>
          {/* User avatar */}
          {!isGuest&&user?.photoURL
            ? <img src={user.photoURL} alt={user.displayName||''} onClick={onProfile}
                style={{width:32,height:32,borderRadius:'50%',border:`2px solid ${profileActive?'#00D4A4':'#374151'}`,cursor:'pointer',transition:'border-color .2s',objectFit:'cover'}}/>
            : <button onClick={onProfile} style={{width:32,height:32,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',background:profileActive?'rgba(0,212,164,.2)':'rgba(31,41,55,.8)',border:`1px solid ${profileActive?'#00D4A4':'#374151'}`,cursor:'pointer',transition:'all .2s'}}>
                <User size={14} color={profileActive?'#00D4A4':'#9ca3af'}/>
              </button>
          }
          {/* Sign out */}
          <button onClick={onSignOut} title={t.signOut}
            style={{width:30,height:30,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',background:'rgba(31,41,55,.6)',border:'1px solid #374151',cursor:'pointer',transition:'all .2s'}}
            onMouseEnter={e=>{e.currentTarget.style.background='rgba(239,68,68,.15)';e.currentTarget.style.borderColor='rgba(239,68,68,.4)';}}
            onMouseLeave={e=>{e.currentTarget.style.background='rgba(31,41,55,.6)';e.currentTarget.style.borderColor='#374151';}}>
            <LogOut size={13} color="#6b7280"/>
          </button>
        </div>
      </div>
    </header>
  );
}

function Footer({ t }) {
  return <footer style={{borderTop:'1px solid #1f2937',padding:'13px 20px',textAlign:'center',fontSize:11,color:'#4b5563'}}>{t.footer}</footer>;
}

// ─── TERMINAL WIDGET ──────────────────────────────────────────────────────────

function TerminalWidget({ value, onChange, onSubmit, disabled, output, t }) {
  const ref=useRef(null);
  useEffect(()=>{ if(ref.current&&!disabled) ref.current.focus(); },[disabled]);
  return (
    <div style={{borderRadius:12,overflow:'hidden',fontFamily:'JetBrains Mono,monospace',background:'#0d1117',border:'1px solid #30363d'}}>
      <div style={{display:'flex',alignItems:'center',gap:6,padding:'7px 13px',background:'#161b22',borderBottom:'1px solid #30363d'}}>
        <div style={{width:11,height:11,borderRadius:'50%',background:'#ef4444'}}/>
        <div style={{width:11,height:11,borderRadius:'50%',background:'#eab308'}}/>
        <div style={{width:11,height:11,borderRadius:'50%',background:'#22c55e'}}/>
        <span style={{fontSize:11,color:'#6b7280',marginLeft:7}}>vault@vaultquest:~$</span>
      </div>
      <div style={{padding:14}}>
        <div style={{display:'flex',alignItems:'center',gap:4}}>
          <span style={{color:'#00D4A4',fontSize:13}}>vault@vaultquest:~$&nbsp;</span>
          <input ref={ref} type="text" value={value} onChange={e=>onChange(e.target.value)} onKeyDown={e=>{if(e.key==='Enter')onSubmit();}} disabled={disabled}
            style={{flex:1,background:'transparent',border:'none',outline:'none',color:'#00D4A4',fontFamily:'inherit',fontSize:13,caretColor:'#00D4A4'}} placeholder={t.termPlaceholder}/>
        </div>
        {output&&<div style={{marginTop:11,fontSize:12,color:output.ok?'#00D4A4':'#ef4444'}}>{output.msg}</div>}
        {!disabled&&<button onClick={onSubmit} style={{marginTop:11,padding:'5px 13px',borderRadius:7,background:'rgba(0,212,164,.2)',color:'#00D4A4',border:'1px solid rgba(0,212,164,.4)',fontSize:12,fontWeight:700,cursor:'pointer'}}>{t.submitBtn}</button>}
      </div>
    </div>
  );
}

function MCQOptions({ options, correct, selected, showResult, onSelect }) {
  return (
    <div style={{display:'flex',flexDirection:'column',gap:9}}>
      {options.map((opt,idx)=>{
        let border='#374151',bg='transparent',color='#d1d5db';
        if(showResult){if(idx===correct){border='#00D4A4';bg='rgba(0,212,164,.1)';color='#00D4A4';}else if(idx===selected){border='#ef4444';bg='rgba(239,68,68,.1)';color='#ef4444';}}
        else if(selected===idx){border='#7C3AED';bg='rgba(124,58,237,.1)';color='#a78bfa';}
        return (
          <button key={idx} onClick={()=>onSelect(idx)} disabled={showResult}
            style={{width:'100%',textAlign:'left',padding:'11px 15px',borderRadius:11,border:`1px solid ${border}`,background:bg,color,cursor:showResult?'default':'pointer',display:'flex',alignItems:'center',gap:11,transition:'all .2s',fontSize:14}}>
            <span style={{width:23,height:23,borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:10,fontWeight:700,background:showResult&&idx===correct?'#00D4A4':showResult&&idx===selected?'#ef4444':'#374151',color:'white',flexShrink:0}}>{String.fromCharCode(65+idx)}</span>
            {opt}
          </button>
        );
      })}
    </div>
  );
}

function TrueFalseButtons({ correct, selected, showResult, onSelect, t }) {
  return (
    <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:14}}>
      {[true,false].map(val=>{
        let border='#374151',bg='transparent',color='#d1d5db';
        if(showResult){if(val===correct){border='#00D4A4';bg='rgba(0,212,164,.1)';color='#00D4A4';}else if(val===selected){border='#ef4444';bg='rgba(239,68,68,.1)';color='#ef4444';}}
        else if(selected===val){border='#7C3AED';bg='rgba(124,58,237,.15)';color='#a78bfa';}
        return (
          <button key={String(val)} onClick={()=>onSelect(val)} disabled={showResult}
            style={{padding:'17px 0',borderRadius:12,border:`2px solid ${border}`,background:bg,color,fontSize:15,fontWeight:700,cursor:showResult?'default':'pointer',transition:'all .2s'}}>
            {val?t.trueBtn:t.falseBtn}
          </button>
        );
      })}
    </div>
  );
}

function ResultPanel({ q, isCorrect, streakMult, earnedXP, onNext, nextLabel, t, lang }) {
  const motivation=MOTIVATION[lang][Math.floor(Math.random()*MOTIVATION[lang].length)];
  const correctLabel=q.type==='MCQ'?q.options[q.correct]:q.type==='TRUE_FALSE'?(q.correct?t.trueBtn:t.falseBtn):q.correct;
  return (
    <div style={{marginTop:18}}>
      <div style={{padding:15,borderRadius:12,background:isCorrect?'rgba(0,212,164,.1)':'rgba(239,68,68,.1)',border:`1px solid ${isCorrect?'#00D4A4':'#ef4444'}`,marginBottom:13}}>
        {isCorrect
          ?<div style={{display:'flex',alignItems:'center',gap:8,color:'#00D4A4',fontWeight:700,marginBottom:8}}><CheckCircle size={17}/>{t.correctMsg} +{earnedXP} XP{streakMult>1&&<span style={{color:'#FFD700',fontSize:11,marginLeft:3}}>×{streakMult} {t.streakBonus}</span>}</div>
          :<div><div style={{display:'flex',alignItems:'flex-start',gap:8,color:'#ef4444',fontWeight:700,marginBottom:6,fontSize:13}}><XCircle size={17} style={{flexShrink:0}}/>{motivation}</div><div style={{fontSize:13,color:'#9ca3af',marginBottom:7}}>{t.correctAnswer} <strong style={{color:'#d1d5db'}}>{correctLabel}</strong></div></div>
        }
        <p style={{fontSize:13,color:'#9ca3af',lineHeight:'1.6'}}>{q.explanation}</p>
      </div>
      <button onClick={onNext} style={{width:'100%',padding:'13px 0',borderRadius:12,fontWeight:700,fontSize:14,color:'white',background:'linear-gradient(135deg,#00D4A4,#7C3AED)',border:'none',cursor:'pointer',transition:'opacity .2s'}}
        onMouseEnter={e=>e.currentTarget.style.opacity='.85'} onMouseLeave={e=>e.currentTarget.style.opacity='1'}>
        {nextLabel}
      </button>
    </div>
  );
}

function ExamQuestion({ q, onAnswer, t }) {
  const [sel,setSel]=useState(null);
  const [termInput,setTermInput]=useState('');
  function submit(ans){ if(sel!==null)return; setSel(ans); setTimeout(()=>onAnswer(ans),400); }
  return (
    <div style={{width:'100%',maxWidth:700}}>
      <div style={{background:'#111827',border:'1px solid #1f2937',borderRadius:20,padding:30}}>
        <div style={{marginBottom:15}}><TypeBadge type={q.type} t={t}/></div>
        <p style={{color:'white',fontSize:16,fontWeight:600,lineHeight:'1.7',marginBottom:22}}>{q.text}</p>
        {q.type==='MCQ'&&<MCQOptions options={q.options} correct={q.correct} selected={sel} showResult={sel!==null} onSelect={submit}/>}
        {q.type==='TRUE_FALSE'&&<TrueFalseButtons correct={q.correct} selected={sel} showResult={sel!==null} onSelect={submit} t={t}/>}
        {q.type==='TERMINAL'&&<TerminalWidget value={termInput} onChange={setTermInput} onSubmit={()=>submit(termInput.trim())} disabled={sel!==null} output={sel!==null?{ok:sel.toLowerCase()===q.correct.toLowerCase(),msg:sel.toLowerCase()===q.correct.toLowerCase()?'✓ Success':'✗ Incorrect'}:null} t={t}/>}
      </div>
    </div>
  );
}

// ─── PRACTICE TERMINAL ────────────────────────────────────────────────────────

function getVaultOutput(cmd) {
  const c = cmd.trim().toLowerCase();
  if (/vault secrets enable/.test(c))       return `Success! Enabled the secrets engine at: ${cmd.split('-path=')[1]?.split(' ')[0] || 'path'}/`;
  if (/vault kv put/.test(c))               return `Key              Value\n─────────────────────\ncreated_time     2024-01-01T00:00:00.000Z\ncustom_metadata  <nil>\ndeletion_time    n/a\ndestroyed        false\nversion          1`;
  if (/vault kv get -version/.test(c))      return `===== Secret Path =====\n${cmd.split(' ').pop()}\n\n== Metadata ==\nKey              Value\n───              ─────\ncreated_time     2024-01-01T00:00:00Z\nversion          ${cmd.match(/-version=(\d+)/)?.[1] || '2'}\n\n== Data ==\n(secret data)`;
  if (/vault kv get/.test(c))               return `===== Secret Path =====\n${cmd.split(' ').pop()}\n\n== Data ==\nKey        Value\n───        ─────\n(values shown here)`;
  if (/vault kv metadata get/.test(c))      return `========== Metadata ==========\nKey                     Value\n───                     ─────\ncreated_time            2024-01-01T00:00:00Z\ncurrent_version         2\nmax_versions            0\nversions                map[1:map[...] 2:map[...]]`;
  if (/vault kv delete/.test(c))            return `Success! Data deleted (if it existed) at: ${cmd.split(' ').pop()}`;
  if (/vault kv destroy/.test(c))           return `Success! Data versions destroyed at: ${cmd.split(' ').pop()}`;
  if (/vault kv list/.test(c))             return `Keys\n────\nalice\nbob\nteam/`;
  if (/vault kv metadata put/.test(c))      return `Success! Metadata updated for: ${cmd.split(' ').pop()}`;
  if (/vault write developers\/config/.test(c)) return `Success! Data written to: developers/config`;
  if (/vault audit enable file/.test(c))    return `Success! Enabled the audit device at: file/`;
  if (/vault audit enable syslog/.test(c))  return `Success! Enabled the audit device at: syslog/`;
  if (/vault audit enable socket/.test(c))  return `Success! Enabled the audit device at: socket/`;
  if (/vault audit list/.test(c))           return `Path     Type    Description    Options\n────     ────    ───────────    ───────\nfile/    file    n/a            file_path=/var/log/vault_audit.log`;
  if (/vault operator rekey -init/.test(c)) return `Nonce:             ae7f7cab-e7b6-a7ad-d5d2-5c0d4e5e0a8e\nStarted:           true\nKey Shares:        5\nKey Threshold:     3\nRemaining Unseal Keys: 3`;
  if (/vault operator rekey/.test(c))       return `Key (will be hidden): \nRekeyProgress  1/3`;
  if (/vault operator rotate/.test(c))      return `Success! Rotated key\n\nKey Term        2\nInstall Time    01 Jan 24 00:00 UTC`;
  if (/vault operator unseal/.test(c))      return `Key                Value\n───                ─────\nSealed             false\nTotal Shares       5\nThreshold          3\nProgress           3/3\nVersion            1.15.0\nStorage Type       raft`;
  if (/vault operator raft list-peers/.test(c)) return `Node           Address              State       Voter\n────           ───────              ─────       ─────\nvault-node-1   vault-node-1:8201    leader      true\nvault-node-2   vault-node-2:8201    follower    true\nvault-node-3   vault-node-3:8201    follower    true`;
  if (/vault operator raft join/.test(c))   return `Joined the cluster successfully.`;
  if (/vault status/.test(c))               return `Key             Value\n───             ─────\nSeal Type       shamir\nInitialized     true\nSealed          false\nTotal Shares    5\nThreshold       3\nVersion         1.15.0\nStorage Type    raft\nHA Enabled      true\nHA Mode         active`;
  if (/vault policy write/.test(c))         return `Success! Uploaded policy: ${cmd.split(' ')[3] || 'policy'}`;
  if (/vault policy read/.test(c))          return `path "secret/data/*" {\n  capabilities = ["create","read","update"]\n}`;
  if (/vault policy list/.test(c))          return `default\nroot\napp-policy`;
  if (/vault token create/.test(c))         return `Key                  Value\n───                  ─────\ntoken                hvs.CAESIKXXXXXXXXXXXXXXXXXXXXXX\ntoken_accessor       abc-123-def\ntoken_duration       1h\ntoken_renewable      true\ntoken_policies       ["default","app-policy"]`;
  if (/vault token lookup/.test(c))         return `Key                 Value\n───                 ─────\naccessor            abc-123-def\nexpire_time         2024-01-01T01:00:00.000Z\nid                  hvs.CAES...\npolicies            [default app-policy]`;
  if (/vault auth enable/.test(c))          return `Success! Enabled the auth method.`;
  if (/vault secrets list/.test(c))         return `Paths\n─────\ncubbyhole/\ndevelopers/\nidentity/\nsecret/\nsys/`;
  if (/vault namespace create/.test(c))     return `Key     Value\n───     ─────\nid      abc-123\npath    ${cmd.split(' ').pop()}/`;
  if (/vault namespace list/.test(c))       return `Keys\n────\nteam-alpha/\nteam-beta/`;
  if (/vault write -f sys\/replication/.test(c)) return `WARNING: Replication enabled. This may take a few minutes.`;
  if (/vault write sys\/replication/.test(c))    return `Success! Data written.`;
  if (/vault secrets enable -seal-wrap/.test(c)) return `Success! Enabled the kv-v2 secrets engine at: sensitive/`;
  if (/vault read sys\/mounts/.test(c))     return `seal_wrap    true\ntype         kv-v2\nversion      2`;
  if (/vault operator generate-root/.test(c)) return `Nonce         abc-123\nStarted       true\nProgress      0/3\nRequired      3\nComplete      false`;
  if (/vault operator init/.test(c))        return `Unseal Key 1: AbCD...\nUnseal Key 2: EfGH...\nUnseal Key 3: IJKL...\nUnseal Key 4: MNOP...\nUnseal Key 5: QRST...\n\nInitial Root Token: hvs.XXXXXXXX\n\nVault initialized with 5 key shares and a key threshold of 3.`;
  if (/vault agent/.test(c))                return `==> Vault agent started! Log data will stream in below:\n==> Vault agent configuration:\n               Caching: enabled (auto-auth token)\n             Log Level: info\n               Version: Vault v1.15.0\n\n[INFO]  sink file: creating file sink\n[INFO]  auth.handler: authenticating`;
  if (/vault write -f auth\/approle/.test(c)) return `Key                Value\n───                ─────\nsecret_id          abc-123-def-456\nsecret_id_accessor xyz-789`;
  if (/vault read auth\/approle/.test(c))   return `Key        Value\n───        ─────\nrole_id    abc-123-def-456`;
  if (/vault write auth\/approle\/login/.test(c)) return `Key                  Value\n───                  ─────\ntoken                hvs.CAESIKXXXXXXX\ntoken_duration       1h\ntoken_policies       ["default","app-policy"]`;
  if (/vault write/.test(c))                return `Success! Data written to: ${cmd.split(' ')[2] || 'path'}`;
  if (/vault read/.test(c))                 return `Key        Value\n───        ─────\n(result)   (value)`;
  return `Success! Command executed.`;
}

function PracticeTerminal({ blocks }) {
  const [history, setHistory] = useState([]);
  const [input, setInput]     = useState('');
  const [histIdx, setHistIdx] = useState(-1);
  const inputRef  = useRef(null);
  const bottomRef = useRef(null);

  const practiceBlocks = (blocks||[]).filter(b => !b.code.includes('\n'));

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior:'smooth' });
  }, [history]);

  function handleSubmit() {
    const cmd = input.trim();
    if (!cmd) return;
    const match = practiceBlocks.find(b => b.code.trim().toLowerCase() === cmd.toLowerCase());
    const isClose = !match && practiceBlocks.some(b => {
      const words = b.code.trim().toLowerCase().split(/\s+/);
      const typed = cmd.toLowerCase().split(/\s+/);
      return typed.filter(w => words.includes(w)).length >= 2;
    });
    const entry = match
      ? { input:cmd, ok:true,  output:getVaultOutput(cmd), label:match.label }
      : { input:cmd, ok:false, hint: isClose ? 'Almost! Check the flags and arguments carefully.' : 'Command not recognized. Try one of the commands shown above.' };
    setHistory(h => [...h, entry]);
    setInput('');
    setHistIdx(-1);
    setTimeout(() => inputRef.current?.focus(), 30);
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') { handleSubmit(); return; }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      const cmds = history.map(h => h.input);
      const next = Math.min(histIdx + 1, cmds.length - 1);
      setHistIdx(next);
      if (cmds[cmds.length - 1 - next] !== undefined) setInput(cmds[cmds.length - 1 - next]);
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const next = Math.max(histIdx - 1, -1);
      setHistIdx(next);
      setInput(next === -1 ? '' : history[history.length - 1 - next]?.input || '');
    }
  }

  return (
    <div style={{marginTop:24,borderRadius:10,overflow:'hidden',border:'1px solid rgba(255,255,255,0.1)'}}>
      {/* Mac title bar */}
      <div style={{background:'#1c1c1e',padding:'8px 14px',display:'flex',alignItems:'center',gap:7,borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
        <span style={{width:12,height:12,borderRadius:'50%',background:'#ff5f57',display:'inline-block',flexShrink:0}}/>
        <span style={{width:12,height:12,borderRadius:'50%',background:'#febc2e',display:'inline-block',flexShrink:0}}/>
        <span style={{width:12,height:12,borderRadius:'50%',background:'#28c840',display:'inline-block',flexShrink:0}}/>
        <span style={{flex:1,textAlign:'center',fontSize:12,color:'#6b7280',fontFamily:'system-ui',marginLeft:-36}}>Practice Terminal</span>
        <button onClick={()=>{setHistory([]);setInput('');}} style={{background:'none',border:'none',color:'#4b5563',cursor:'pointer',fontSize:11,fontFamily:'system-ui'}}>Clear</button>
      </div>
      {/* Output area */}
      <div style={{background:'#0d1117',padding:'12px 16px',minHeight:130,maxHeight:240,overflowY:'auto',fontFamily:'"Fira Code",monospace',fontSize:12,lineHeight:1.6}}>
        {history.length === 0 && (
          <div style={{color:'#374151'}}>
            {practiceBlocks.map((b,i) => <div key={i} style={{color:'#4b5563'}}># {b.label}: <span style={{color:'#374151'}}>{b.code}</span></div>)}
            <div style={{marginTop:8,color:'#374151'}}>Type a command and press Enter ↵  (↑ history)</div>
          </div>
        )}
        {history.map((h,i) => (
          <div key={i} style={{marginBottom:10}}>
            <div><span style={{color:'#4b5563',userSelect:'none'}}>vault@learn:~$ </span><span style={{color:'#00D4A4'}}>{h.input}</span></div>
            {h.ok
              ? <pre style={{margin:'3px 0 0 0',color:'#a3e635',whiteSpace:'pre-wrap',background:'none',padding:0,fontSize:11,lineHeight:1.5}}>{h.output}</pre>
              : <div style={{color:'#f87171',marginTop:2,fontSize:11}}>✗ {h.hint}</div>
            }
          </div>
        ))}
        <div ref={bottomRef}/>
      </div>
      {/* Input row */}
      <div style={{background:'#0d1117',borderTop:'1px solid rgba(255,255,255,0.06)',padding:'8px 16px',display:'flex',alignItems:'center',gap:8}}>
        <span style={{color:'#4b5563',fontFamily:'"Fira Code",monospace',fontSize:12,userSelect:'none',flexShrink:0}}>vault@learn:~$</span>
        <input ref={inputRef} value={input}
          onChange={e=>setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="type a vault command…"
          autoComplete="off" spellCheck={false}
          style={{flex:1,background:'none',border:'none',outline:'none',color:'#e2e8f0',fontFamily:'"Fira Code",monospace',fontSize:12,caretColor:'#00D4A4'}}
        />
        <button onClick={handleSubmit} style={{background:'rgba(0,212,164,.15)',border:'1px solid rgba(0,212,164,.3)',color:'#00D4A4',padding:'3px 10px',borderRadius:4,cursor:'pointer',fontSize:11,fontFamily:'system-ui'}}>↵</button>
      </div>
    </div>
  );
}

// ─── TUTORIAL SCREEN ──────────────────────────────────────────────────────────

function TutorialScreen({ chapter, lang, t, onBack, onStartQuiz }) {
  const [step, setStep] = useState(0);
  const [copied, setCopied] = useState(null);
  const tutorial = TUTORIALS[chapter.id];
  if (!tutorial) return null;

  const totalSteps = tutorial.steps.length;
  const current = tutorial.steps[step];
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 768;

  function copyCode(code, idx) {
    navigator.clipboard.writeText(code).then(() => {
      setCopied(idx);
      setTimeout(() => setCopied(null), 2000);
    });
  }

  const noteColors = {
    info:  { border:'#3B82F6', bg:'rgba(59,130,246,0.1)', icon:'ℹ️', label: t.tutorialNoteLabel },
    warn:  { border:'#F59E0B', bg:'rgba(245,158,11,0.1)',  icon:'⚠️', label: t.tutorialWarnLabel },
    tip:   { border:'#00D4A4', bg:'rgba(0,212,164,0.1)',   icon:'💡', label: t.tutorialTipLabel },
  };

  return (
    <div style={{minHeight:'100vh',background:'var(--vault-dark)',color:'#e2e8f0',fontFamily:'system-ui,sans-serif'}}>
      {/* Top bar */}
      <div style={{position:'sticky',top:0,zIndex:50,background:'rgba(17,24,39,0.95)',backdropFilter:'blur(8px)',borderBottom:'1px solid rgba(0,212,164,0.2)',padding:'12px 20px',display:'flex',alignItems:'center',gap:12}}>
        <button onClick={onBack} style={{background:'none',border:'1px solid rgba(255,255,255,0.15)',color:'#9ca3af',padding:'6px 12px',borderRadius:6,cursor:'pointer',fontSize:13,whiteSpace:'nowrap'}}>
          {t.tutorialBack}
        </button>
        <span style={{fontSize:20}}>{tutorial.emoji}</span>
        <span style={{fontWeight:700,color:'#e2e8f0',fontSize:15,flex:1,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{tutorial.title}</span>
        <span style={{color:'#9ca3af',fontSize:13,whiteSpace:'nowrap'}}>{t.tutorialStep} {step+1} {t.tutorialOf} {totalSteps}</span>
      </div>

      <div style={{display:'flex',maxWidth:1100,margin:'0 auto',gap:0}}>
        {/* Sidebar */}
        {!isMobile && (
          <div style={{width:240,minWidth:240,padding:'24px 0',borderRight:'1px solid rgba(255,255,255,0.06)'}}>
            <div style={{padding:'0 16px 12px',fontSize:11,fontWeight:700,color:'#6b7280',letterSpacing:'0.1em',textTransform:'uppercase'}}>Steps</div>
            {tutorial.steps.map((s, i) => (
              <button key={i} onClick={() => setStep(i)} style={{display:'block',width:'100%',textAlign:'left',padding:'10px 16px',background:'none',border:'none',cursor:'pointer',borderLeft: i===step ? '3px solid var(--vault-green)' : '3px solid transparent',color: i===step ? '#e2e8f0' : '#6b7280',fontSize:13,lineHeight:1.4,transition:'all 0.15s'}}>
                <span style={{display:'block',fontSize:11,color: i===step ? 'var(--vault-green)' : '#4b5563',marginBottom:2}}>{i+1}</span>
                {s.title}
              </button>
            ))}
          </div>
        )}

        {/* Main content */}
        <div style={{flex:1,padding:'28px 28px 80px',minWidth:0}}>
          {/* Intro (step 0 only) */}
          {step === 0 && (
            <div style={{background:'rgba(0,212,164,0.07)',border:'1px solid rgba(0,212,164,0.25)',borderRadius:10,padding:'14px 18px',marginBottom:22,fontSize:14,color:'#a7f3d0',lineHeight:1.6}}>
              {tutorial.intro}
            </div>
          )}

          {/* Mobile step selector */}
          {isMobile && (
            <div style={{display:'flex',gap:6,marginBottom:20,flexWrap:'wrap'}}>
              {tutorial.steps.map((s, i) => (
                <button key={i} onClick={() => setStep(i)} style={{padding:'6px 12px',borderRadius:6,border: i===step ? '1px solid var(--vault-green)' : '1px solid rgba(255,255,255,0.1)',background: i===step ? 'rgba(0,212,164,0.15)' : 'none',color: i===step ? 'var(--vault-green)' : '#6b7280',fontSize:12,cursor:'pointer'}}>
                  {i+1}. {s.title}
                </button>
              ))}
            </div>
          )}

          {/* Progress bar */}
          <div style={{display:'flex',gap:4,marginBottom:22}}>
            {tutorial.steps.map((_, i) => (
              <div key={i} style={{flex:1,height:4,borderRadius:2,background: i<=step ? 'var(--vault-green)' : 'rgba(255,255,255,0.1)',transition:'background 0.3s'}} />
            ))}
          </div>

          {/* Step title */}
          <h2 style={{fontSize:22,fontWeight:700,color:'#f1f5f9',marginBottom:16,lineHeight:1.3}}>{current.title}</h2>

          {/* Body paragraphs */}
          {current.body.map((para, i) => (
            <p key={i} style={{color:'#cbd5e1',fontSize:14,lineHeight:1.7,marginBottom:12}}>{para}</p>
          ))}

          {/* Code blocks */}
          {current.blocks && current.blocks.map((block, i) => (
            <div key={i} style={{marginBottom:16}}>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',background:'rgba(255,255,255,0.04)',borderRadius:'8px 8px 0 0',padding:'8px 14px',borderBottom:'1px solid rgba(255,255,255,0.06)'}}>
                <span style={{fontSize:12,color:'#9ca3af',fontFamily:'monospace'}}>{block.label}</span>
                <button onClick={() => copyCode(block.code, `${step}-${i}`)} style={{background:'none',border:'1px solid rgba(255,255,255,0.15)',color: copied===`${step}-${i}` ? 'var(--vault-green)' : '#9ca3af',padding:'3px 10px',borderRadius:4,cursor:'pointer',fontSize:11,transition:'color 0.2s'}}>
                  {copied===`${step}-${i}` ? t.tutorialCopied : t.tutorialCopy}
                </button>
              </div>
              <pre style={{background:'#0d1117',borderRadius:'0 0 8px 8px',padding:'14px',margin:0,fontSize:13,color:'#e2e8f0',fontFamily:'"Fira Code",monospace',overflowX:'auto',whiteSpace:'pre-wrap',wordBreak:'break-all',lineHeight:1.6}}>{block.code}</pre>
            </div>
          ))}

          {/* Note/Warning/Tip box */}
          {current.note && (() => {
            const nc = noteColors[current.note.type] || noteColors.info;
            return (
              <div style={{border:`1px solid ${nc.border}`,background:nc.bg,borderRadius:8,padding:'12px 16px',marginTop:20,marginBottom:8,display:'flex',gap:10,alignItems:'flex-start'}}>
                <span style={{fontSize:16,flexShrink:0,marginTop:1}}>{nc.icon}</span>
                <div>
                  <span style={{fontWeight:700,color:nc.border,fontSize:12,textTransform:'uppercase',letterSpacing:'0.05em'}}>{nc.label}: </span>
                  <span style={{color:'#cbd5e1',fontSize:13,lineHeight:1.6}}>{current.note.text}</span>
                </div>
              </div>
            );
          })()}

          {/* Practice Terminal */}
          <PracticeTerminal key={step} blocks={current.blocks||[]} />

          {/* Navigation */}
          <div style={{display:'flex',justifyContent:'space-between',marginTop:32,paddingTop:20,borderTop:'1px solid rgba(255,255,255,0.08)'}}>
            <button onClick={() => setStep(s => s-1)} disabled={step===0} style={{background:'none',border:'1px solid rgba(255,255,255,0.15)',color: step===0 ? '#374151' : '#9ca3af',padding:'10px 18px',borderRadius:8,cursor: step===0 ? 'default' : 'pointer',fontSize:14}}>
              {t.tutorialPrev}
            </button>
            {step < totalSteps-1 ? (
              <button onClick={() => setStep(s => s+1)} style={{background:'var(--vault-green)',color:'#0a0e1a',padding:'10px 22px',borderRadius:8,border:'none',cursor:'pointer',fontSize:14,fontWeight:700}}>
                {t.tutorialNext}
              </button>
            ) : (
              <button onClick={onStartQuiz} style={{background:'linear-gradient(135deg,var(--vault-green),#00a87f)',color:'#0a0e1a',padding:'10px 22px',borderRadius:8,border:'none',cursor:'pointer',fontSize:14,fontWeight:700,boxShadow:'0 0 16px rgba(0,212,164,0.4)'}}>
                {t.tutorialDone}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────

export default function App() {
  // Auth state
  const [user,setUser]             = useState(null);   // Firebase user | {isGuest:true} | null
  const [authLoading,setAuthLoading] = useState(true);

  // Game state
  const [gs,setGs]           = useState(defaultState);
  const [lang,setLangRaw]    = useState(()=>loadLang());
  const [view,setView]        = useState('dashboard');
  const [chapter,setChapter]  = useState(null);
  const [tutorialChapter,setTutorialChapter] = useState(null);
  const [qIdx,setQIdx]        = useState(0);
  const [selAnswer,setSelAnswer] = useState(null);
  const [showResult,setShowResult] = useState(false);
  const [termInput,setTermInput]   = useState('');
  const [termOutput,setTermOutput] = useState(null);
  const [chapterDone,setChapterDone] = useState(false);
  const [sessionXP,setSessionXP]   = useState(0);
  const [earnedXP,setEarnedXP]     = useState(0);
  const [floatXP,setFloatXP]       = useState(null);
  const [levelUpShow,setLevelUpShow] = useState(false);
  const [resetModal,setResetModal]   = useState(false);   // 'all' | 'chapters' | false
  const [resetSelected,setResetSelected] = useState([]);

  // Exam state
  const [examMode,setExamMode]     = useState(false);
  const [examQs,setExamQs]         = useState([]);
  const [examIdx,setExamIdx]       = useState(0);
  const [examAnswers,setExamAnswers] = useState({});
  const [examDone,setExamDone]     = useState(false);
  const [examTimeLeft,setExamTimeLeft] = useState(45*60);
  const [examStart,setExamStart]   = useState(null);
  const [examReview,setExamReview] = useState(false);

  const fwRef = useRef(null);

  // Derived
  const t        = TRANSLATIONS[lang];
  const chapters = CHAPTERS[lang];
  const badges   = BADGES[lang];
  const tips     = TIPS[lang];
  const Q        = QUESTIONS[lang];

  const uid = user?.uid || (user?.isGuest ? 'guest' : null);

  function setLang(l){ setLangRaw(l); localStorage.setItem(LANG_KEY,l); }

  // Firebase auth listener
  useEffect(()=>{
    if(!FIREBASE_CONFIGURED){ setAuthLoading(false); return; }
    const unsub = onAuthStateChanged(auth, fbUser => {
      if(fbUser){
        setUser(fbUser);
        setGs(loadState(fbUser.uid));
      } else {
        setUser(null);
        setGs(defaultState);
      }
      setAuthLoading(false);
    });
    return unsub;
  },[]);

  // Persist game state
  useEffect(()=>{ if(uid) saveState(gs,uid); },[gs,uid]);

  // Exam countdown
  useEffect(()=>{
    if(!examMode||examDone)return;
    const id=setInterval(()=>setExamTimeLeft(s=>{ if(s<=1){clearInterval(id);setExamDone(true);return 0;} return s-1; }),1000);
    return()=>clearInterval(id);
  },[examMode,examDone]);

  // Keyboard shortcuts
  useEffect(()=>{
    const h=(e)=>{
      if(e.key==='Escape'){setView('dashboard');return;}
      if(view!=='question'||showResult)return;
      const q=chapter?Q[chapter.id][qIdx]:null; if(!q)return;
      if(q.type==='MCQ'){const i=parseInt(e.key)-1;if(i>=0&&i<q.options.length)handleMCQ(i);}
      if(q.type==='TRUE_FALSE'){if(e.key==='t'||e.key==='T')handleTF(true);if(e.key==='f'||e.key==='F')handleTF(false);}
      if(e.key==='Enter'&&q.type==='TERMINAL')handleTerminal();
    };
    window.addEventListener('keydown',h);
    return()=>window.removeEventListener('keydown',h);
  },[view,showResult,chapter,qIdx,termInput,Q]);

  function handleGuest(){ const g={isGuest:true,uid:'guest',displayName:null,photoURL:null}; setUser(g); setGs(loadState('guest')); }

  async function handleSignOut(){
    if(FIREBASE_CONFIGURED&&auth?.currentUser) await signOut(auth);
    setUser(null); setGs(defaultState); setView('dashboard'); setExamMode(false);
  }

  // ── XP ──
  function awardXP(base,streakBefore){
    const mult=getStreakMult(streakBefore), earned=Math.round(base*mult);
    setGs(prev=>{
      const newXP=prev.totalXP+earned, oldLvl=getLevel(prev.totalXP), newLvl=getLevel(newXP);
      if(newLvl>oldLvl){setLevelUpShow(true);setTimeout(()=>setLevelUpShow(false),2500);}
      return{...prev,totalXP:newXP,level:newLvl};
    });
    setSessionXP(s=>s+earned); setEarnedXP(earned);
    setFloatXP({v:earned,mult,id:Date.now()});
    setTimeout(()=>setFloatXP(null),1500);
    return earned;
  }

  function handleCorrect(q){ awardXP(q.xp,gs.streak); const ns=gs.streak+1; setGs(prev=>({...prev,streak:ns,maxStreak:Math.max(prev.maxStreak,ns),answeredQuestions:{...prev.answeredQuestions,[q.id]:true}})); triggerFireworks(fwRef); }
  function handleIncorrect(q){ setGs(prev=>({...prev,streak:0,answeredQuestions:{...prev.answeredQuestions,[q.id]:false}})); }
  function isAnswerCorrect(q){ if(q.type==='MCQ')return selAnswer===q.correct; if(q.type==='TRUE_FALSE')return selAnswer===q.correct; if(q.type==='TERMINAL')return termInput.trim().toLowerCase()===q.correct.toLowerCase(); return false; }
  function handleMCQ(idx){ if(showResult||selAnswer!==null)return; const q=Q[chapter.id][qIdx]; setSelAnswer(idx); setShowResult(true); idx===q.correct?handleCorrect(q):handleIncorrect(q); }
  function handleTF(val){ if(showResult)return; const q=Q[chapter.id][qIdx]; setSelAnswer(val); setShowResult(true); val===q.correct?handleCorrect(q):handleIncorrect(q); }
  function handleTerminal(){ if(showResult)return; const q=Q[chapter.id][qIdx]; const ok=termInput.trim().toLowerCase()===q.correct.toLowerCase(); setSelAnswer(termInput.trim()); setShowResult(true); setTermOutput({ok,msg:ok?'✓ Success — command executed successfully':'✗ vault: command not recognized. Hint: check the vault syntax'}); ok?handleCorrect(q):handleIncorrect(q); }
  function handleNext(){ const qs=Q[chapter.id]; if(qIdx+1>=qs.length){const bi=chapter.id-1;if(!gs.badges.includes(bi))setGs(p=>({...p,badges:[...p.badges,bi]}));setChapterDone(true);}else{setQIdx(i=>i+1);setSelAnswer(null);setShowResult(false);setTermInput('');setTermOutput(null);} }
  function startChapter(ch){ setChapter(ch);setQIdx(0);setSelAnswer(null);setShowResult(false);setTermInput('');setTermOutput(null);setChapterDone(false);setSessionXP(0);setView('question'); }
  function startTutorial(ch){ setTutorialChapter(ch);setView('tutorial'); }
  function startExam(){ const allQs=Object.values(Q).flat(),sampled=shuffle(allQs).slice(0,20); setExamQs(sampled);setExamIdx(0);setExamAnswers({});setExamDone(false);setExamTimeLeft(45*60);setExamStart(Date.now());setExamReview(false);setExamMode(true);setView('question'); }
  function handleExamAnswer(qId,ans){ const na={...examAnswers,[qId]:ans}; setExamAnswers(na); if(examIdx+1>=examQs.length)setExamDone(true); else setExamIdx(i=>i+1); }
  function handleReset(){ setResetModal('choose'); }
  function doResetAll(){ setGs({...defaultState});setResetModal(false);setResetSelected([]);setView('dashboard'); }
  function doResetSelected(){ resetSelected.forEach(id=>resetChapter(chapters.find(c=>c.id===id)));setResetModal(false);setResetSelected([]); }
  function toggleResetChapter(id){ setResetSelected(s=>s.includes(id)?s.filter(x=>x!==id):[...s,id]); }
  function resetChapter(ch){ const qIds=Q[ch.id].map(q=>q.id); setGs(prev=>{const aq={...prev.answeredQuestions};qIds.forEach(id=>delete aq[id]);return{...prev,answeredQuestions:aq,badges:prev.badges.filter(b=>b!==ch.id-1)};}); }

  const todayTip = tips[new Date().getDate()%10];
  const headerProps = { gs, lang, setLang, t, user, onSignOut:handleSignOut };

  // ── Loading ──
  if(authLoading){
    return (
      <div style={{background:'#0a0e1a',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <style>{CSS_VARS}</style>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:48,marginBottom:16}} className="auth-float">🔐</div>
          <div style={{width:40,height:40,border:'3px solid #1f2937',borderTopColor:'#00D4A4',borderRadius:'50%',margin:'0 auto',animation:'spin .8s linear infinite'}}/>
        </div>
        <style>{`@keyframes spin{to{transform:rotate(360deg);}}`}</style>
      </div>
    );
  }

  // ── Not authenticated → Auth screen ──
  if(!user){
    return <AuthScreen t={t} lang={lang} setLang={setLang} onGuest={handleGuest}/>;
  }

  // ══ TUTORIAL VIEW ══════════════════════════════════════════════════════════════
  if(view==='tutorial' && tutorialChapter){
    return (
      <>
        <style>{CSS_VARS}</style>
        <TutorialScreen
          chapter={tutorialChapter}
          lang={lang}
          t={t}
          onBack={()=>setView('dashboard')}
          onStartQuiz={()=>startChapter(tutorialChapter)}
        />
      </>
    );
  }

  // ══ EXAM MODE ══════════════════════════════════════════════════════════════════
  if(examMode){
    const mins=Math.floor(examTimeLeft/60),secs=examTimeLeft%60;
    const timerStr=`${String(mins).padStart(2,'0')}:${String(secs).padStart(2,'0')}`;
    const isLow=examTimeLeft<300;

    if(examDone){
      const correct=examQs.filter(q=>{const a=examAnswers[q.id];if(q.type==='MCQ')return a===q.correct;if(q.type==='TRUE_FALSE')return a===q.correct;if(q.type==='TERMINAL')return typeof a==='string'&&a.trim().toLowerCase()===q.correct.toLowerCase();return false;}).length;
      const pct=Math.round((correct/examQs.length)*100),passed=pct>=75;
      const elapsed=examStart?Math.floor((Date.now()-examStart)/1000):0;
      const timeStr=`${Math.floor(elapsed/60)}m ${elapsed%60}s`;
      return (
        <div style={{background:'var(--vault-dark)',minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:22}}>
          <style>{CSS_VARS}</style>
          <div style={{background:'#111827',border:`2px solid ${passed?'#00D4A4':'#ef4444'}`,borderRadius:20,padding:38,maxWidth:550,width:'100%',textAlign:'center'}}>
            <div style={{fontSize:62,marginBottom:14}}>{passed?'🏆':'📚'}</div>
            <h2 style={{fontSize:25,fontWeight:800,color:passed?'#00D4A4':'#ef4444',marginBottom:7}}>{passed?t.passed:t.keepStudying}</h2>
            <div style={{fontSize:54,fontWeight:900,color:'white',margin:'10px 0'}}>{pct}%</div>
            <div style={{color:'#6b7280',marginBottom:4}}>{correct} / {examQs.length} {t.correctWord} · {t.passThreshold}</div>
            <div style={{color:'#4b5563',fontSize:12,marginBottom:26}}>{t.timeTaken} {timeStr}</div>
            {examReview&&(
              <div style={{textAlign:'left',marginBottom:18,maxHeight:380,overflowY:'auto',display:'flex',flexDirection:'column',gap:9}}>
                {examQs.map((q,i)=>{
                  const a=examAnswers[q.id];let ok=false;
                  if(q.type==='MCQ')ok=a===q.correct;else if(q.type==='TRUE_FALSE')ok=a===q.correct;else if(q.type==='TERMINAL')ok=typeof a==='string'&&a.trim().toLowerCase()===q.correct.toLowerCase();
                  return(
                    <div key={q.id} style={{padding:11,borderRadius:10,background:ok?'rgba(0,212,164,.08)':'rgba(239,68,68,.08)',border:`1px solid ${ok?'#00D4A4':'#ef4444'}`}}>
                      <div style={{fontSize:10,fontWeight:700,color:ok?'#00D4A4':'#ef4444',marginBottom:3}}>Q{i+1} — {ok?t.q.correct:t.q.incorrect}</div>
                      <div style={{fontSize:13,color:'#d1d5db'}}>{q.text}</div>
                      {q.type==='MCQ'&&<div style={{fontSize:11,color:'#6b7280',marginTop:3}}>{t.correctAnswer} {q.options[q.correct]}</div>}
                      {q.type==='TRUE_FALSE'&&<div style={{fontSize:11,color:'#6b7280',marginTop:3}}>{t.correctAnswer} {q.correct?t.trueBtn:t.falseBtn}</div>}
                      {q.type==='TERMINAL'&&<div style={{fontSize:11,color:'#6b7280',marginTop:3,fontFamily:'JetBrains Mono,monospace'}}>{t.correctAnswer} {q.correct}</div>}
                    </div>
                  );
                })}
              </div>
            )}
            <div style={{display:'flex',gap:11,justifyContent:'center',flexWrap:'wrap'}}>
              <button onClick={()=>setExamReview(r=>!r)} style={{padding:'9px 18px',borderRadius:9,background:'rgba(0,212,164,.15)',color:'#00D4A4',border:'1px solid rgba(0,212,164,.3)',fontWeight:600,cursor:'pointer'}}>{examReview?t.hideReview:t.reviewAnswers}</button>
              <button onClick={()=>{setExamMode(false);setView('dashboard');}} style={{padding:'9px 18px',borderRadius:9,background:'rgba(124,58,237,.2)',color:'#a78bfa',border:'1px solid rgba(124,58,237,.3)',fontWeight:600,cursor:'pointer'}}>{t.backDash}</button>
            </div>
          </div>
        </div>
      );
    }

    const eq=examQs[examIdx];
    return (
      <div style={{background:'var(--vault-dark)',minHeight:'100vh',display:'flex',flexDirection:'column'}}>
        <style>{CSS_VARS}</style>
        <div style={{background:'#111827',borderBottom:'1px solid #1f2937',padding:'11px 22px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:10}}>
            <span style={{color:'white',fontWeight:700}}>{t.examMode}</span>
            <LangPicker lang={lang} setLang={setLang}/>
          </div>
          <span style={{color:'#6b7280',fontSize:13}}>Q {examIdx+1} / {examQs.length}</span>
          <span style={{fontSize:17,fontWeight:900,fontFamily:'JetBrains Mono,monospace',color:isLow?'#ef4444':'white'}}>{timerStr}</span>
        </div>
        <div style={{height:3,background:'#1f2937'}}><div style={{height:'100%',width:`${(examIdx/examQs.length)*100}%`,background:'linear-gradient(90deg,#00D4A4,#7C3AED)',transition:'width .3s ease'}}/></div>
        <div style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:22}}>
          <ExamQuestion key={eq.id} q={eq} onAnswer={ans=>handleExamAnswer(eq.id,ans)} t={t}/>
        </div>
      </div>
    );
  }

  // ══ QUESTION VIEW ══════════════════════════════════════════════════════════════
  if(view==='question'&&chapter){
    const qs=Q[chapter.id],q=qs[qIdx],progPct=(qIdx/qs.length)*100;
    if(chapterDone){
      return(
        <div style={{background:'var(--vault-dark)',minHeight:'100vh',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',padding:22}}>
          <style>{CSS_VARS}</style>
          <div ref={fwRef} style={{background:'#111827',border:'2px solid #00D4A4',borderRadius:20,padding:38,maxWidth:510,width:'100%',textAlign:'center',boxShadow:'0 0 38px rgba(0,212,164,.2)'}}>
            <div className="badge-pop-anim" style={{fontSize:62,marginBottom:14}}>{badges[chapter.id-1].split(' ')[0]}</div>
            <h2 style={{fontSize:22,fontWeight:800,color:'white',marginBottom:7}}>{t.chapterComplete}</h2>
            <p style={{color:'#6b7280',marginBottom:4}}>{chapter.emoji} {chapter.title}</p>
            <div style={{fontSize:38,fontWeight:900,color:'#00D4A4',margin:'14px 0'}}>+{sessionXP} XP</div>
            <div style={{padding:13,borderRadius:12,background:'rgba(0,212,164,.1)',border:'1px solid rgba(0,212,164,.3)',marginBottom:22}}>
              <div style={{fontSize:11,color:'#6b7280',marginBottom:3}}>{t.badgeUnlocked}</div>
              <div style={{fontSize:15,fontWeight:700,color:'white'}}>{badges[chapter.id-1]}</div>
            </div>
            <button onClick={()=>setView('dashboard')} style={{width:'100%',padding:'13px 0',borderRadius:12,fontWeight:700,fontSize:14,color:'white',background:'linear-gradient(135deg,#00D4A4,#7C3AED)',border:'none',cursor:'pointer'}}>{t.backDash}</button>
          </div>
        </div>
      );
    }
    const correct=isAnswerCorrect(q);
    return(
      <div style={{background:'var(--vault-dark)',minHeight:'100vh',display:'flex',flexDirection:'column'}}>
        <style>{CSS_VARS}</style>
        <div style={{background:'#111827',borderBottom:'1px solid #1f2937',padding:'11px 22px',display:'flex',alignItems:'center',justifyContent:'space-between'}}>
          <div style={{display:'flex',alignItems:'center',gap:7,fontSize:13}}>
            <button onClick={()=>setView('dashboard')} style={{background:'none',border:'none',cursor:'pointer',color:'#6b7280',display:'flex',alignItems:'center'}}><Home size={15}/></button>
            <ChevronRight size={11} color="#4b5563"/>
            <span style={{color:'#6b7280'}}>{chapter.emoji} {chapter.title}</span>
            <ChevronRight size={11} color="#4b5563"/>
            <span style={{color:'#d1d5db',fontWeight:600}}>Q {qIdx+1} / {qs.length}</span>
          </div>
          {gs.streak>=2&&<span style={{padding:'2px 10px',borderRadius:99,fontSize:12,fontWeight:700,background:gs.streak>=5?'rgba(255,215,0,.2)':'rgba(249,115,22,.2)',color:gs.streak>=5?'#FFD700':'#fb923c'}}>🔥 {gs.streak}</span>}
        </div>
        <div style={{height:3,background:'#1f2937'}}><div style={{height:'100%',width:`${progPct}%`,background:'linear-gradient(90deg,#00D4A4,#7C3AED)',transition:'width .3s ease'}}/></div>
        <div ref={fwRef} style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:22}}>
          <div style={{width:'100%',maxWidth:670,position:'relative'}}>
            {floatXP&&<div key={floatXP.id} className="float-xp-anim" style={{position:'absolute',top:0,left:'50%',fontWeight:800,fontSize:17,color:'#00D4A4',pointerEvents:'none',zIndex:10,whiteSpace:'nowrap'}}>+{floatXP.v} XP {floatXP.mult>1&&<span style={{color:'#FFD700',fontSize:12}}>×{floatXP.mult}</span>}</div>}
            <div style={{background:'#111827',border:'1px solid #1f2937',borderRadius:20,padding:28}}>
              <div style={{display:'flex',alignItems:'center',justifyContent:'space-between',marginBottom:14}}>
                <TypeBadge type={q.type} t={t}/><span style={{fontSize:11,color:'#4b5563'}}>+{q.xp} XP</span>
              </div>
              <p style={{color:'white',fontSize:16,fontWeight:600,lineHeight:'1.7',marginBottom:22}}>{q.text}</p>
              {q.type==='MCQ'&&<MCQOptions options={q.options} correct={q.correct} selected={selAnswer} showResult={showResult} onSelect={handleMCQ}/>}
              {q.type==='TRUE_FALSE'&&<TrueFalseButtons correct={q.correct} selected={selAnswer} showResult={showResult} onSelect={handleTF} t={t}/>}
              {q.type==='TERMINAL'&&<TerminalWidget value={termInput} onChange={setTermInput} onSubmit={handleTerminal} disabled={showResult} output={termOutput} t={t}/>}
              {showResult&&<ResultPanel q={q} isCorrect={correct} streakMult={getStreakMult(gs.streak-1)} earnedXP={earnedXP} onNext={handleNext} nextLabel={qIdx+1>=qs.length?t.completeBtn:t.nextBtn} t={t} lang={lang}/>}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ══ PROFILE VIEW ═══════════════════════════════════════════════════════════════
  if(view==='profile'){
    const lvl=getLevel(gs.totalXP);
    const allDone=chapters.every(c=>{const qs=Q[c.id];const ok=qs.filter(q=>gs.answeredQuestions[q.id]===true).length;return getChapterProg(c.id,gs.answeredQuestions,lang)>=1&&ok/qs.length>=0.75;});
    const isGuest=!user||user.isGuest;
    return(
      <div style={{background:'var(--vault-dark)',minHeight:'100vh',display:'flex',flexDirection:'column'}}>
        <style>{CSS_VARS}</style>
        <Header {...headerProps} onProfile={()=>setView('dashboard')} profileActive/>
        <div style={{flex:1,maxWidth:670,margin:'0 auto',width:'100%',padding:'22px 14px',display:'flex',flexDirection:'column',gap:18}}>
          {/* User info card */}
          <div style={{background:'#111827',border:'1px solid #1f2937',borderRadius:20,padding:26,textAlign:'center'}}>
            {!isGuest&&user?.photoURL
              ?<img src={user.photoURL} alt="" style={{width:72,height:72,borderRadius:'50%',border:'3px solid #00D4A4',marginBottom:12,objectFit:'cover'}}/>
              :<div style={{fontSize:62,marginBottom:11}}>{getLevelAvatar(lvl)}</div>
            }
            <div style={{fontSize:21,fontWeight:800,color:'white'}}>{!isGuest&&user?.displayName ? user.displayName : t.vaultWarrior}</div>
            {!isGuest&&user?.email&&<div style={{fontSize:12,color:'#6b7280',marginTop:2}}>{user.email}</div>}
            {isGuest&&<div style={{fontSize:12,color:'#4b5563',marginTop:2}}>— {t.guestNote} —</div>}
            <div style={{color:'#6b7280',fontSize:12,marginTop:4}}>{t.level} {lvl} · {gs.totalXP} XP</div>
            {allDone&&<div style={{display:'inline-block',marginTop:9,padding:'2px 11px',borderRadius:99,background:'rgba(255,215,0,.2)',color:'#FFD700',fontSize:12,fontWeight:700}}>{t.vaultPro}</div>}
            <div style={{marginTop:14}}><XPBar xp={gs.totalXP} t={t}/></div>
          </div>
          {/* Stats */}
          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:13}}>
            {[{label:t.currentStreak,val:`🔥 ${gs.streak}`,c:'#FFD700'},{label:t.bestStreak,val:gs.maxStreak,c:'#00D4A4'}].map(s=>(
              <div key={s.label} style={{background:'#111827',border:'1px solid #1f2937',borderRadius:15,padding:17,textAlign:'center'}}>
                <div style={{fontSize:25,fontWeight:800,color:s.c}}>{s.val}</div>
                <div style={{fontSize:11,color:'#6b7280',marginTop:3}}>{s.label}</div>
              </div>
            ))}
          </div>
          {/* Badges */}
          <div style={{background:'#111827',border:'1px solid #1f2937',borderRadius:20,padding:22}}>
            <div style={{display:'flex',alignItems:'center',gap:7,marginBottom:14,color:'white',fontWeight:700}}><Trophy size={15} color="#FFD700"/> {t.badgesTitle}</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:9}}>
              {badges.map((badge,i)=>{const earned=gs.badges.includes(i);return(
                <div key={i} style={{padding:'9px 11px',borderRadius:11,border:`1px solid ${earned?'#00D4A4':'#374151'}`,background:earned?'rgba(0,212,164,.08)':'rgba(31,41,55,.5)',color:earned?'#00D4A4':'#6b7280',fontSize:12,fontWeight:500,boxShadow:earned?'0 0 9px rgba(0,212,164,.14)':'none',transition:'all .3s'}}>
                  {earned?badge:`🔒 ${badge.split(' ').slice(1).join(' ')}`}
                </div>
              );})}
            </div>
          </div>
          {/* Shortcuts */}
          <div style={{background:'#111827',border:'1px solid #1f2937',borderRadius:20,padding:22}}>
            <div style={{fontWeight:700,color:'white',marginBottom:13}}>{t.shortcutsTitle}</div>
            <div style={{display:'flex',flexDirection:'column',gap:7}}>
              {t.shortcuts.map(([k,d])=>(
                <div key={k} style={{display:'flex',alignItems:'center',gap:11}}>
                  <kbd style={{padding:'2px 7px',borderRadius:5,background:'#1f2937',color:'#00D4A4',border:'1px solid #374151',fontFamily:'JetBrains Mono,monospace',fontSize:10}}>{k}</kbd>
                  <span style={{fontSize:12,color:'#9ca3af'}}>{d}</span>
                </div>
              ))}
            </div>
          </div>
          {/* Reset + Sign out */}
          <button onClick={handleReset} style={{padding:'11px 0',borderRadius:12,border:'1px solid #ef4444',background:'transparent',color:'#ef4444',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:7,fontSize:13,transition:'background .2s'}}
            onMouseEnter={e=>e.currentTarget.style.background='rgba(239,68,68,.08)'} onMouseLeave={e=>e.currentTarget.style.background='transparent'}>
            <RotateCcw size={15}/> {t.resetBtn}
          </button>

          {/* ── Reset Modal ── */}
          {resetModal && (
            <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.7)',zIndex:200,display:'flex',alignItems:'center',justifyContent:'center',padding:16}} onClick={()=>setResetModal(false)}>
              <div style={{background:'#111827',border:'1px solid rgba(239,68,68,.4)',borderRadius:16,padding:28,width:'100%',maxWidth:440,boxShadow:'0 25px 60px rgba(0,0,0,.6)'}} onClick={e=>e.stopPropagation()}>
                {/* Header */}
                <div style={{display:'flex',alignItems:'center',gap:10,marginBottom:6}}>
                  <span style={{fontSize:22}}>⚠️</span>
                  <span style={{fontSize:17,fontWeight:700,color:'#f1f5f9'}}>{t.resetModalTitle}</span>
                </div>
                <p style={{color:'#f87171',fontSize:12,marginBottom:20}}>{t.resetModalWarn}</p>

                {resetModal === 'choose' && (
                  <div style={{display:'flex',flexDirection:'column',gap:10}}>
                    {/* Option 1 — reset all */}
                    <button onClick={()=>setResetModal('confirm-all')}
                      style={{padding:'14px 16px',borderRadius:10,border:'1px solid rgba(239,68,68,.4)',background:'rgba(239,68,68,.08)',color:'#f87171',cursor:'pointer',textAlign:'left',transition:'background .2s'}}
                      onMouseEnter={e=>e.currentTarget.style.background='rgba(239,68,68,.18)'}
                      onMouseLeave={e=>e.currentTarget.style.background='rgba(239,68,68,.08)'}>
                      <div style={{fontWeight:700,fontSize:14,marginBottom:3}}>🗑️ {t.resetAllBtn}</div>
                      <div style={{fontSize:12,color:'#9ca3af'}}>{t.resetAllDesc}</div>
                    </button>
                    {/* Option 2 — reset by chapter */}
                    <button onClick={()=>setResetModal('chapters')}
                      style={{padding:'14px 16px',borderRadius:10,border:'1px solid rgba(245,158,11,.3)',background:'rgba(245,158,11,.07)',color:'#fbbf24',cursor:'pointer',textAlign:'left',transition:'background .2s'}}
                      onMouseEnter={e=>e.currentTarget.style.background='rgba(245,158,11,.15)'}
                      onMouseLeave={e=>e.currentTarget.style.background='rgba(245,158,11,.07)'}>
                      <div style={{fontWeight:700,fontSize:14,marginBottom:3}}>📋 {t.resetChaptersBtn}</div>
                      <div style={{fontSize:12,color:'#9ca3af'}}>{t.resetChaptersDesc}</div>
                    </button>
                    <button onClick={()=>setResetModal(false)} style={{padding:'10px',borderRadius:10,border:'1px solid #374151',background:'transparent',color:'#6b7280',cursor:'pointer',fontSize:13,marginTop:4}}>
                      {t.resetCancel}
                    </button>
                  </div>
                )}

                {resetModal === 'confirm-all' && (
                  <div>
                    <p style={{color:'#cbd5e1',fontSize:14,marginBottom:20,lineHeight:1.6}}>
                      Tu vas perdre tout ton XP, tes badges, tes séries et ta progression sur les {chapters.length} chapitres.
                    </p>
                    <div style={{display:'flex',gap:10}}>
                      <button onClick={()=>setResetModal('choose')} style={{flex:1,padding:'10px',borderRadius:10,border:'1px solid #374151',background:'transparent',color:'#6b7280',cursor:'pointer',fontSize:13}}>
                        ← {t.resetCancel}
                      </button>
                      <button onClick={doResetAll} style={{flex:1,padding:'10px',borderRadius:10,border:'none',background:'#ef4444',color:'white',cursor:'pointer',fontWeight:700,fontSize:13}}>
                        {t.resetConfirmAll}
                      </button>
                    </div>
                  </div>
                )}

                {resetModal === 'chapters' && (
                  <div>
                    <p style={{color:'#9ca3af',fontSize:12,marginBottom:12}}>{t.resetChapterSelect}</p>
                    <div style={{display:'flex',flexDirection:'column',gap:6,maxHeight:280,overflowY:'auto',marginBottom:16}}>
                      {chapters.map(ch=>{
                        const prog = getChapterProg(ch.id, gs.answeredQuestions, lang);
                        const checked = resetSelected.includes(ch.id);
                        const hasProgress = prog > 0;
                        return (
                          <label key={ch.id} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 12px',borderRadius:8,border:`1px solid ${checked?'rgba(239,68,68,.5)':'rgba(255,255,255,.08)'}`,background:checked?'rgba(239,68,68,.08)':'rgba(255,255,255,.02)',cursor:hasProgress?'pointer':'default',opacity:hasProgress?1:0.4}}>
                            <input type="checkbox" checked={checked} disabled={!hasProgress} onChange={()=>hasProgress&&toggleResetChapter(ch.id)}
                              style={{accentColor:'#ef4444',width:15,height:15,flexShrink:0}}/>
                            <span style={{fontSize:16}}>{ch.emoji}</span>
                            <div style={{flex:1,minWidth:0}}>
                              <div style={{fontSize:13,color:'#e2e8f0',fontWeight:checked?600:400}}>{ch.title}</div>
                              <div style={{fontSize:11,color:'#6b7280'}}>{hasProgress ? `${Math.round(prog*100)}% complété` : 'Pas encore commencé'}</div>
                            </div>
                          </label>
                        );
                      })}
                    </div>
                    <div style={{display:'flex',gap:10}}>
                      <button onClick={()=>{setResetModal('choose');setResetSelected([]);}} style={{flex:1,padding:'10px',borderRadius:10,border:'1px solid #374151',background:'transparent',color:'#6b7280',cursor:'pointer',fontSize:13}}>
                        ← {t.resetCancel}
                      </button>
                      <button onClick={doResetSelected} disabled={resetSelected.length===0}
                        style={{flex:1,padding:'10px',borderRadius:10,border:'none',background:resetSelected.length===0?'#374151':'#ef4444',color:resetSelected.length===0?'#6b7280':'white',cursor:resetSelected.length===0?'default':'pointer',fontWeight:700,fontSize:13}}>
                        {t.resetSelectedBtn} {resetSelected.length>0&&`(${resetSelected.length})`}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
          <button onClick={handleSignOut} style={{padding:'11px 0',borderRadius:12,border:'1px solid #374151',background:'transparent',color:'#6b7280',fontWeight:600,cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:7,fontSize:13,transition:'all .2s'}}
            onMouseEnter={e=>{e.currentTarget.style.color='#9ca3af';e.currentTarget.style.borderColor='#6b7280';}} onMouseLeave={e=>{e.currentTarget.style.color='#6b7280';e.currentTarget.style.borderColor='#374151';}}>
            <LogOut size={15}/> {t.signOut}
          </button>
        </div>
        <Footer t={t}/>
      </div>
    );
  }

  // ══ DASHBOARD ══════════════════════════════════════════════════════════════════
  return(
    <div style={{background:'var(--vault-dark)',minHeight:'100vh',display:'flex',flexDirection:'column'}}>
      <style>{CSS_VARS}</style>
      {levelUpShow&&(
        <div style={{position:'fixed',inset:0,display:'flex',alignItems:'center',justifyContent:'center',zIndex:50,pointerEvents:'none'}}>
          <div className="slide-in-anim" style={{textAlign:'center',background:'rgba(10,14,26,.92)',padding:'28px 44px',borderRadius:20,border:'2px solid #FFD700',boxShadow:'0 0 55px rgba(255,215,0,.3)'}}>
            <div style={{fontSize:46,marginBottom:7}}>⬆</div>
            <div style={{fontSize:30,fontWeight:900,color:'#FFD700'}}>LEVEL UP!</div>
            <div style={{fontSize:17,color:'white',marginTop:3}}>{t.level} {getLevel(gs.totalXP)}</div>
          </div>
        </div>
      )}
      <Header {...headerProps} onProfile={()=>setView('profile')}/>
      <main style={{flex:1,maxWidth:1100,margin:'0 auto',width:'100%',padding:'22px 14px'}}>
        <p style={{textAlign:'center',color:'#6b7280',fontSize:12,marginBottom:22}}>{t.subtitle}</p>
        {/* Tip */}
        <div style={{padding:'13px 17px',borderRadius:13,background:'rgba(0,212,164,.06)',border:'1px solid rgba(0,212,164,.24)',display:'flex',gap:11,marginBottom:28,alignItems:'flex-start'}}>
          <span style={{fontSize:20,flexShrink:0}}>💡</span>
          <div>
            <div style={{fontSize:10,fontWeight:700,color:'#00D4A4',marginBottom:3,letterSpacing:1}}>{t.tipTitle}</div>
            <p style={{fontSize:13,color:'#d1d5db',lineHeight:'1.6'}}>{todayTip}</p>
          </div>
        </div>
        {/* Chapter grid */}
        <div style={{display:'grid',gridTemplateColumns:'repeat(auto-fill,minmax(215px,1fr))',gap:15,marginBottom:32}}>
          {chapters.map(ch=>{
            const locked=isLocked(ch.id,gs.answeredQuestions,lang);
            const prog=getChapterProg(ch.id,gs.answeredQuestions,lang);
            const answered=Q[ch.id].filter(q=>gs.answeredQuestions[q.id]!==undefined).length;
            const total=Q[ch.id].length;
            return(
              <div key={ch.id}
                style={{background:'#111827',border:`1px solid ${locked?'#1f2937':prog>0?'rgba(0,212,164,.35)':'#374151'}`,borderRadius:17,padding:19,display:'flex',flexDirection:'column',opacity:locked?.55:1,transition:'transform .2s,box-shadow .2s',boxShadow:!locked&&prog>0?'0 0 17px rgba(0,212,164,.08)':'none'}}
                onMouseEnter={e=>{if(!locked){e.currentTarget.style.transform='translateY(-3px) scale(1.02)';e.currentTarget.style.boxShadow='0 8px 30px rgba(0,212,164,.14)';}}}
                onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow=!locked&&prog>0?'0 0 17px rgba(0,212,164,.08)':'none';}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:11}}>
                  <span style={{fontSize:28}}>{locked?'🔒':ch.emoji}</span>
                  <div style={{position:'relative',width:44,height:44,display:'flex',alignItems:'center',justifyContent:'center'}}>
                    <CircularProgress pct={prog} size={44}/>
                    <span style={{position:'absolute',fontSize:8,fontWeight:700,color:'#00D4A4'}}>{Math.round(prog*100)}%</span>
                  </div>
                </div>
                <div style={{fontWeight:700,color:locked?'#4b5563':'white',fontSize:13,marginBottom:5}}>{ch.title}</div>
                <Stars n={ch.stars}/>
                <div style={{display:'flex',justifyContent:'space-between',marginTop:9,fontSize:11,color:'#6b7280'}}>
                  <span>{answered}/{total} {t.qDone}</span>
                  <span style={{color:'#FFD700'}}>+{ch.xpReward} XP</span>
                </div>
                <div style={{display:'flex',gap:7,marginTop:13}}>
                  <button onClick={()=>!locked&&startChapter(ch)} disabled={locked}
                    style={{flex:1,padding:'7px 0',borderRadius:9,fontWeight:700,fontSize:12,cursor:locked?'not-allowed':'pointer',transition:'all .2s',border:`1px solid ${locked?'#374151':prog>0?'rgba(0,212,164,.5)':'rgba(124,58,237,.5)'}`,background:locked?'rgba(31,41,55,.5)':prog>0?'rgba(0,212,164,.15)':'rgba(124,58,237,.2)',color:locked?'#4b5563':prog>0?'#00D4A4':'#a78bfa'}}>
                    {locked?t.lockedBtn:prog===0?t.startBtn:prog>=1?t.reviewBtn:t.continueBtn}
                  </button>
                  <button onClick={e=>{e.stopPropagation();startTutorial(ch);}} title={t.tutorialBtn}
                    style={{padding:'7px 10px',borderRadius:9,border:'1px solid rgba(0,212,164,.5)',background:'rgba(0,212,164,.12)',color:'#00D4A4',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',gap:4,transition:'all .2s',flexShrink:0,fontSize:12,fontWeight:600,whiteSpace:'nowrap'}}
                    onMouseEnter={e=>{e.currentTarget.style.background='rgba(0,212,164,.25)';e.currentTarget.style.borderColor='#00D4A4';}}
                    onMouseLeave={e=>{e.currentTarget.style.background='rgba(0,212,164,.12)';e.currentTarget.style.borderColor='rgba(0,212,164,.5)';}}>
                    📖 Tuto
                  </button>
                  {prog>0&&!locked&&(
                    <button onClick={e=>{e.stopPropagation();resetChapter(ch);}} title="Reset"
                      style={{width:32,height:32,borderRadius:9,border:'1px solid rgba(239,68,68,.4)',background:'rgba(239,68,68,.1)',color:'#f87171',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',transition:'all .2s',flexShrink:0}}
                      onMouseEnter={e=>{e.currentTarget.style.background='rgba(239,68,68,.25)';e.currentTarget.style.borderColor='#ef4444';}}
                      onMouseLeave={e=>{e.currentTarget.style.background='rgba(239,68,68,.1)';e.currentTarget.style.borderColor='rgba(239,68,68,.4)';}}>
                      <RotateCcw size={13}/>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        {/* Exam */}
        <div style={{textAlign:'center'}}>
          <button onClick={startExam}
            style={{padding:'15px 34px',borderRadius:13,fontWeight:800,fontSize:15,color:'white',background:'linear-gradient(135deg,#7C3AED,#00D4A4)',border:'none',cursor:'pointer',display:'inline-flex',alignItems:'center',gap:11,boxShadow:'0 0 38px rgba(124,58,237,.34)',transition:'transform .2s,box-shadow .2s'}}
            onMouseEnter={e=>{e.currentTarget.style.transform='scale(1.04)';e.currentTarget.style.boxShadow='0 0 55px rgba(124,58,237,.5)';}}
            onMouseLeave={e=>{e.currentTarget.style.transform='';e.currentTarget.style.boxShadow='0 0 38px rgba(124,58,237,.34)';}}>
            <Clock size={19}/> {t.examBtn}
          </button>
        </div>
      </main>
      <Footer t={t}/>
    </div>
  );
}
