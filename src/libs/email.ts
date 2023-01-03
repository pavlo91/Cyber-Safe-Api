import postmark from "postmark";

import path from "path";
import fs from "fs";
import ejs from "ejs";

import logger from "./logger";
import config from "../config";

const TEMPLATE_PATH = path.resolve(process.cwd(), "src/templates");

export enum EmailTemplate {
  BLANK = "BLANK"
}

const TemplatePaths = {
  [EmailTemplate.BLANK]: path.resolve(TEMPLATE_PATH, "blank.ejs")
};

async function compileTemplate(template: EmailTemplate, data: any) {
  let templateString;

  if (!fs.existsSync(TemplatePaths[template])) {
    logger.warn(`Email template "${TemplatePaths[template]}" does not exist.`);
    return null;
  }

  try {
    templateString = fs.readFileSync(TemplatePaths[template], "utf8");
  } catch (err) {
    logger.error(err);
    return null;
  }

  return ejs.render(templateString, data);
}

export type SendEmailArgs = {
  to: string | string[];
  subject: string;
  body?: string;
  template?: {
    name: EmailTemplate;
    data: any;
  };
};

export async function sendEmail(args: SendEmailArgs) {
  const to = args.to instanceof Array ? args.to : [args.to];

  logger.info("Sending e-mail to %s...", args.to);

  if (!config.postmark.token) {
    logger.warn("No keys set for postmark");
    return;
  }

  const emailOptions = {
    From: `Boilerplate <${config.postmark.from}>`,
    Subject: args.subject,
    HtmlBody: args.body
  };

  if (args.template) {
    const emailTemplate = await compileTemplate(args.template.name, args.template.data);

    if (emailTemplate) {
      emailOptions.HtmlBody = emailTemplate;
    }
  }

  const client = new postmark.ServerClient(config.postmark.token);

  return await client.sendEmailBatch(to.map(To => ({ To, ...emailOptions })));
}
