require_relative "./spec_helper.rb"

describe "App", :type => :request, :js => true do

  before do
    visit '/'
    stub_request(:data => { :message => "Not Found" }, :meta => { :status => 404 })
  end

  it "displays the about text on the start" do
    find('#about').should be_visible
    find('#gist_list').text.should be_empty
  end

  it "displays not found for a wrong gist" do
    fill_in 'gist', :with => 'wrong-gist-number'
    click_button 'submit'

    page.driver.browser.switch_to.alert.text.should eq('Not Found')
    page.driver.browser.switch_to.alert.accept

    find_field('gist').value.should be_empty
  end

  context "with the selected gist" do

    before do
      stub_request(gist_response)
      fill_in 'gist', :with => 'gist-number'
      click_button 'submit'
    end

    it "displays a gist title" do
      within "#gist_title" do
        page.should have_content('Test Gist')
        page.should have_content('Sun Jan 1')
      end
    end

    it "displays gist files" do
      within "#gist_list" do
        page.should have_link('index.erb')
        page.should have_link('style.css')
      end
    end

    it "runs erb gist file" do
      click_link 'Run'
      page.driver.browser.switch_to.frame('index.erb')
      page.should have_content('Hello')
      page.driver.browser.switch_to.default_content
    end

    it "runs editable erb gist file" do
      scope = find_link('Run').find(:xpath,".//../..")

      within(scope) do
        click_link('Edit')
        find('textarea').should be_visible
        find('textarea').set("<h1><%= ['H', 'i'].join %><h1>")
        click_link 'Run'
      end

      page.driver.browser.switch_to.frame('index.erb')
      page.should have_content('Hi')
      page.driver.browser.switch_to.default_content
    end

  end

  # Stub request via JSONP helper.
  def stub_request(response)
    page.execute_script "$.stubGetJSON(#{response.to_json})"
  end

  # The successful gist response.
  def gist_response
    erb = "<h1><%= ['H', 'e', 'l', 'l', 'o'].join %><h1>"
    css = "h1 { color: red; }"

    { :data => { :id => "gist-number",
                 :description => 'Test Gist',
                 :created_at => '2012-01-01',
                 :files => { 'index.erb' => { :language => 'HTML+ERB', :filename => 'index.erb', :raw_url => '#index', :content => erb },
                             'style.css' => { :language => 'CSS', :filename => 'style.css', :raw_url => '#style', :content => css } } },
      :meta => { :status => 200 }}
  end

end
