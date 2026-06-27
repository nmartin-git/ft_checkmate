'use client'

import { useState } from "react";
import Modal from "@/src/components/ui/Modal";
import useParametersModal from "@/src/hooks/useParametersModal";
import NotifPopup from "@/src/components/ui/NotifPopup";

const ParametersModal= () => {
	const parametersModal = useParametersModal();
	const [recoveryCodes, setRecoveryCodes] = useState<string[] | null>(null);

	const bodyContent = (
  		<div className="space-y-4 text-black">
  		  <p className="text-sm text-gray-600">
  		    Conservez ces codes en lieu sûr. **Ils ne seront affichés qu'une seule fois.**
  		  </p>

  		  <div className="bg-gray-100 p-3 rounded font-mono text-sm space-y-1 select-all">
  		    {parametersModal.recoveryCodes?.map((code, index) => (
  		      <div key={index} className="py-0.5 border-b border-gray-200 last:border-0">
  		        {code}
  		      </div>
  		    ))}
  		  </div>

  		  <button 
  		    type="button"
  		    onClick={() => {
  		      if (parametersModal.recoveryCodes) {
  		        navigator.clipboard.writeText(parametersModal.recoveryCodes.join("\n"));
  		        alert("Codes copiés !");
  		      }
  		    }}
  		    className="w-full bg-black text-white text-sm py-2 rounded hover:bg-gray-800 transition-colors"
  		  >
  		    Copier tous les codes
  		  </button>
  		</div>
	);
	return (
    	<div>
        <NotifPopup
        disabled={false}
        isOpen={parametersModal.isOpen}
        title="Recovery codes"
        onClose={parametersModal.onClose}
        body={bodyContent}
        />
    	</div>
    );
}

export default ParametersModal