import { Footer } from "flowbite-react"
import { BsFacebook, BsInstagram, BsLinkedin, BsTwitter, BsWhatsapp } from "react-icons/bs"
import { Link } from "react-router-dom"

const FooterComponent = () => {
  return (
    <Footer container className="border border-t-8 border-blue-900 shadow-md">
      <div className="w-full max-w-7xl mx-auto">
         <div className="grid w-full justify-between sms:flex md:grid-cols-1">
            <div className="mt-5">
               <Link to='/' className="self-center">
                  DeliveryYa
               </Link>
            </div>
            <div className="grid grid-cols-2 gap-8 mt-4 sms:grid-cols-3 md:grid-cols-4 sm:gap-6">
               <div className="">
                  <Footer.Title title="About"/>
                  <Footer.LinkGroup col>
                     <Footer.Link href="#" target="_blank" rel="noopener noreferrer">Services</Footer.Link>
                     <Footer.Link href="#" target="_blank" rel="noopener noreferrer">Partners</Footer.Link>
                  </Footer.LinkGroup>
               </div>
               <div className="">
                  <Footer.Title title="Follow Us"/>
                  <Footer.LinkGroup col>
                     <Footer.Link href="#" target="_blank" rel="noopener noreferrer">Facebook</Footer.Link>
                     <Footer.Link href="#" target="_blank" rel="noopener noreferrer">Instagram</Footer.Link>
                  </Footer.LinkGroup>
               </div>
               <div className="">
                  <Footer.Title title="Legal"/>
                  <Footer.LinkGroup col>
                     <Footer.Link href="#" target="_blank" rel="noopener noreferrer">Privacy Policy</Footer.Link>
                     <Footer.Link href="#" target="_blank" rel="noopener noreferrer">Terms & Condition</Footer.Link>
                  </Footer.LinkGroup>
               </div>
               <div className="">
                  <Footer.Title title="Connect With Us"/>
                  <Footer.LinkGroup col>
                     <Footer.Link href="#" target="_blank" rel="noopener noreferrer">+ 71 2345 6789</Footer.Link>
                     <Footer.Link href="#" target="_blank" rel="noopener noreferrer">+ 71 2345 6789</Footer.Link>
                  </Footer.LinkGroup>
               </div>
            </div>
         </div>
         <Footer.Divider className="my-5"/>
         <div className="w-full sm:flex sm:items-center sm:justify-between">
            <Footer.Copyright href="#" by="DeliveryYa" year={new Date().getFullYear()} />
            <div className="flex gap-6 sm:mt-0 mt-4 sm:justify-center">
               <Footer.Icon href="#" icon={BsFacebook} />
               <Footer.Icon href="#" icon={BsInstagram} />
               <Footer.Icon href="#" icon={BsTwitter} />
               <Footer.Icon href="#" icon={BsLinkedin} />
               <Footer.Icon href="#" icon={BsWhatsapp} />
            </div>
         </div> 
      </div>
    </Footer>
  )
}

export default FooterComponent