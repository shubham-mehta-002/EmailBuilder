const getEmailLayout = async (req, res) => { 
    let layout = await fs.readFile('./templates/layout.html', 'utf8');
    res.setHeader('Content-Type', "text/html"); 
    res.status(200).send(layout);
}


module.exports = {
    getEmailLayout
};
