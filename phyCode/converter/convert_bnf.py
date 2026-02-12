import os
import json
import re
import argparse
import sys

class BNFError(Exception):
    pass

def parse_bnf_line(line, current_rule, rules):
    line = line.strip()
    if not line:
        return current_rule

    # Check for new rule definition <name> ::= ...
    match = re.match(r'^<([^>]+)>\s*::=\s*(.*)$', line)
    if match:
        name = match.group(1)
        definition = match.group(2).strip()
        
        if name in rules:
            # If strictly merging without allowing redefinition, raise error.
            # However, "merge" usually implies adding to the collection.
            # If same rule exists, it's ambiguous. I will raise an error.
            raise BNFError(f"Duplicate rule definition found: <{name}>")
        
        rules[name] = definition
        return name
    else:
        # Continuation of previous rule
        if current_rule:
             # Basic check to see if it looks like a continuation (e.g. starts with | or just continuation)
             # Standard BNF usually requires | for alternatives, but some just wrap.
             # I will append with space.
             rules[current_rule] += " " + line
             return current_rule
        else:
            raise BNFError(f"Invalid BNF line (orphaned content): {line}")

def validate_definition(grammar):
    # Check for basic syntax errors in definitions
    # Expected tokens: "string", 'string', <identifier!>, |, whitespace
    
    # Simple regex validator for the RHS
    # Allowed: 
    # - <identifier!>
    # - "string" or 'string'
    # - |
    # - whitespace
    
    # We can try to tokenize it to validate.
    token_pattern = re.compile(r'(\s+)|(<[^>]+>)|("[^"]*")|(\'[^\']*\')|(\|)')
    
    for rule, definition in grammar.items():
        pos = 0
        while pos < len(definition):
            match = token_pattern.match(definition, pos)
            if match:
                pos = match.end()
            else:
                raise BNFError(f"Invalid syntax in rule <{rule}> at position {pos}: ...{definition[pos:]}")

def process_bnf_files(target_folder):
    rules = {}
    
    if not os.path.exists(target_folder):
        raise FileNotFoundError(f"Folder not found: {target_folder}")

    for root, _, files in os.walk(target_folder):
        for file in files:
            if file.endswith(".bnf"):
                file_path = os.path.join(root, file)
                try:
                    with open(file_path, 'r', encoding='utf-8') as f:
                        lines = f.readlines()
                        
                    current_rule = None
                    for line in lines:
                        cleaned = line.strip()
                        if not cleaned: 
                            continue
                        current_rule = parse_bnf_line(line, current_rule, rules)
                        
                except Exception as e:
                    raise BNFError(f"Error parsing file {file_path}: {str(e)}")

    validate_definition(rules)
    return rules

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Convert and merge BNF files to JSON.")
    parser.add_argument("folder", help="Target folder containing .bnf files")
    parser.add_argument("--output", default="grammar.json", help="Output JSON file path")
    
    args = parser.parse_args()
    
    try:
        grammar = process_bnf_files(args.folder)
        with open(args.output, 'w', encoding='utf-8') as f:
            json.dump(grammar, f, indent=4)
        print(f"Successfully converted BNF files to {args.output}")
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)
