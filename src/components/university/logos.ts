// Maps every supported university to its primary web domain so we can resolve
// a reliable logo through Google's favicon service. The local SVG fallback
// guarantees the UI still renders if a third-party image is blocked.

const NAME_TO_DOMAIN: Record<string, string> = {
  'Harvard University': 'harvard.edu',
  'Yale University': 'yale.edu',
  'Princeton University': 'princeton.edu',
  'Columbia University': 'columbia.edu',
  'University of Pennsylvania': 'upenn.edu',
  'Dartmouth College': 'dartmouth.edu',
  'Brown University': 'brown.edu',
  'Cornell University': 'cornell.edu',
  'Stanford University': 'stanford.edu',
  'MIT': 'mit.edu',
  'Massachusetts Institute of Technology': 'mit.edu',
  'University of Chicago': 'uchicago.edu',
  'Northwestern University': 'northwestern.edu',
  'Duke University': 'duke.edu',
  'Johns Hopkins University': 'jhu.edu',
  'California Institute of Technology': 'caltech.edu',
  'Vanderbilt University': 'vanderbilt.edu',
  'Rice University': 'rice.edu',
  'Washington University in St. Louis': 'wustl.edu',
  'Emory University': 'emory.edu',
  'Carnegie Mellon University': 'cmu.edu',
  'University of Notre Dame': 'nd.edu',
  'Georgetown University': 'georgetown.edu',
  'University of Southern California': 'usc.edu',
  'Tufts University': 'tufts.edu',
  'Wake Forest University': 'wfu.edu',
  'Boston College': 'bc.edu',
  'New York University': 'nyu.edu',
  'Tulane University': 'tulane.edu',
  'UC Berkeley': 'berkeley.edu',
  'University of California Berkeley': 'berkeley.edu',
  'UCLA': 'ucla.edu',
  'University of California Los Angeles': 'ucla.edu',
  'University of Michigan': 'umich.edu',
  'University of Virginia': 'virginia.edu',
  'Georgia Tech': 'gatech.edu',
  'Georgia Institute of Technology': 'gatech.edu',
  'UC San Diego': 'ucsd.edu',
  'UC Santa Barbara': 'ucsb.edu',
  'UC Irvine': 'uci.edu',
  'UC Davis': 'ucdavis.edu',
  'University of North Carolina at Chapel Hill': 'unc.edu',
  'University of Florida': 'ufl.edu',
  'University of Texas at Austin': 'utexas.edu',
  'University of Washington': 'washington.edu',
  'University of Wisconsin-Madison': 'wisc.edu',
  'University of Illinois at Urbana-Champaign': 'illinois.edu',
  'Ohio State University': 'osu.edu',
  'Penn State University': 'psu.edu',
  'University of Maryland': 'umd.edu',
  'Purdue University': 'purdue.edu',
  'University of Minnesota': 'umn.edu',
  'Rutgers University': 'rutgers.edu',
  'University of Pittsburgh': 'pitt.edu',
  'Virginia Tech': 'vt.edu',
  'Texas A&M University': 'tamu.edu',
  'University of Connecticut': 'uconn.edu',
  'University of Delaware': 'udel.edu',
  'University of Vermont': 'uvm.edu',
  'University of New Hampshire': 'unh.edu',
  'University of Maine': 'umaine.edu',
  'University of Rhode Island': 'uri.edu',
  'University of Massachusetts Amherst': 'umass.edu',
  'University of California San Francisco': 'ucsf.edu',
  'University of Rochester': 'rochester.edu',
  'Case Western Reserve University': 'case.edu',
  'Brandeis University': 'brandeis.edu',
  'University of Miami': 'miami.edu',
  'Northeastern University': 'northeastern.edu',
  'Boston University': 'bu.edu',
  'Rensselaer Polytechnic Institute': 'rpi.edu',
  'University of California Santa Cruz': 'ucsc.edu',
};

export function getUniversityLogo(name: string): string {
  const domain = NAME_TO_DOMAIN[name];
  if (domain) {
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(domain)}&sz=128`;
  }
  // Last-resort: infer an .edu domain
  const slug = name
    .toLowerCase()
    .replace(/university of |the |college|university|institute|of/g, '')
    .replace(/[^a-z]/g, '')
    .slice(0, 16);
  return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(`${slug}.edu`)}&sz=128`;
}

export function getClearbitLogo(name: string): string {
  const domain = NAME_TO_DOMAIN[name];
  if (domain) return `https://logo.clearbit.com/${domain}`;
  return '';
}

export function getMonogramFallback(name: string): string {
  const initials = name
    .split(/\s+/)
    .filter((w) => /^[A-Z]/.test(w))
    .slice(0, 3)
    .map((w) => w[0])
    .join('');
  const label = initials || name.slice(0, 3).toUpperCase();
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" role="img" aria-label="${name}"><rect width="128" height="128" rx="20" fill="#1e40af"/><circle cx="64" cy="54" r="30" fill="#ffffff" opacity="0.12"/><path d="M20 92h88v10H20zM28 86h72L64 66 28 86z" fill="#ffffff" opacity="0.28"/><text x="64" y="60" text-anchor="middle" dominant-baseline="middle" font-family="Arial, Helvetica, sans-serif" font-size="34" font-weight="700" fill="#fff">${label}</text></svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

