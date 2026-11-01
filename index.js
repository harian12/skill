import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const pluginDir = path.dirname(fileURLToPath(import.meta.url));
const skillsDir = path.resolve(pluginDir, "skills");
const agentsDir = path.resolve(pluginDir, "agents");

// Sinkronisasi otomatis ke direktori global OpenCode
function syncToGlobalConfig() {
  try {
    const home = process.env.USERPROFILE || process.env.HOME;
    if (!home) return;

    const opencodeDir = path.join(home, ".config", "opencode");
    const targetSkillsDir = path.join(opencodeDir, "skills");
    const targetAgentsDir = path.join(opencodeDir, "agents");

    if (!fs.existsSync(targetSkillsDir)) fs.mkdirSync(targetSkillsDir, { recursive: true });
    if (!fs.existsSync(targetAgentsDir)) fs.mkdirSync(targetAgentsDir, { recursive: true });

    // Salin skills ke ~/.config/opencode/skills/
    if (fs.existsSync(skillsDir)) {
      for (const skillName of fs.readdirSync(skillsDir)) {
        const srcSkillPath = path.join(skillsDir, skillName);
        const destSkillPath = path.join(targetSkillsDir, skillName);
        if (fs.statSync(srcSkillPath).isDirectory()) {
          fs.cpSync(srcSkillPath, destSkillPath, { recursive: true, force: true });
        }
      }
    }

    // Salin agents ke ~/.config/opencode/agents/
    if (fs.existsSync(agentsDir)) {
      for (const agentFile of fs.readdirSync(agentsDir)) {
        if (agentFile.endsWith(".md")) {
          const srcAgent = path.join(agentsDir, agentFile);
          const destAgent = path.join(targetAgentsDir, agentFile);
          fs.copyFileSync(srcAgent, destAgent);
        }
      }
    }
  } catch {
    // Abaikan jika permission dibatasi
  }
}

// OpenCode v2 Plugin Definition (Default Export)
export const SkillPlugin = {
  id: "skill",
  name: "harian12-skills",
  description: "Enterprise Hono Backend & Nuxt 4 Frontend Skills and Agents",

  // OpenCode v2 Setup Lifecycle Hook
  async setup(ctx) {
    syncToGlobalConfig();
  },

  // OpenCode v1 Server Compatibility Hook
  async server() {
    syncToGlobalConfig();
    return {
      config: async (config) => {
        config.skills = config.skills || {};
        config.skills.paths = config.skills.paths || [];
        if (!config.skills.paths.includes(skillsDir)) {
          config.skills.paths.push(skillsDir);
        }
      },
    };
  },
};

// Legacy v1 callable function export untuk backward-compatibility
export const legacyPlugin = async () => {
  syncToGlobalConfig();
  return {
    config: async (config) => {
      config.skills = config.skills || {};
      config.skills.paths = config.skills.paths || [];
      if (!config.skills.paths.includes(skillsDir)) {
        config.skills.paths.push(skillsDir);
      }
    },
  };
};

export default SkillPlugin;
