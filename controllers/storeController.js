/**
  req = object of data coming in
  res = object full of methods of sending data back to user
 */
exports.homePage = (req, res) => {
  res.render('index')
}
