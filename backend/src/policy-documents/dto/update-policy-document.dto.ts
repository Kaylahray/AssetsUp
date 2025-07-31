import { PartialType } from "@nestjs/mapped-types";
import { CreatePolicyDocumentDto } from "./create-policy-document.dto";

export class UpdatePolicyDocumentDto extends PartialType(CreatePolicyDocumentDto) {} 