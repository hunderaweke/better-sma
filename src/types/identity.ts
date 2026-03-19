export interface Identity {
  id: string;
  name: string;
  uniqueString: string;
}

export interface IdentityTagProps {
  uniqueString: string;
  className?: string;
}

export interface IdentityDropdownItem {
  id: string;
  name: string;
  uniqueString?: string;
}
