import React from "react";
import { LinkageBtn, LinkageRulesCodeStr } from "../linkage";

const OptionsLinkage: React.FC<LinkageRulesCodeStr> = (props) => {

  return <LinkageBtn {...props} controlField={{ type: 'CodeTextArea', }} />
}

export default OptionsLinkage;
